import { fetchModulos } from '../presentation/services/moduleService'
import { logger } from '../presentation/utils/logger'

// Business rules configuration
export const COURSE_BUSINESS_RULES = {
  MIN_ACTIVE_MODULES: 1,
  MIN_CONTENT_PER_MODULE: 1,
  REQUIRED_MODULE_TYPES: ['video', 'quiz', 'document'],
  AUTO_SUGGEST_MODULE_ACTIVATION: true,
  VALIDATE_MODULE_CONTENT: true
}

// Module validation result
export interface ModuleValidationResult {
  isValid: boolean
  canBeActivated: boolean
  reasons: string[]
  suggestions: string[]
  moduleCount: number
  activeModuleCount: number
  modulesWithContent: number
  recommendedModules: string[]
}

// Course activation eligibility
export interface CourseActivationEligibility {
  canActivate: boolean
  reasons: string[]
  suggestions: string[]
  requiredActions: string[]
  autoActivationPossible: boolean
  modulesToActivate: string[]
}

// Validate a single module
export const validateModule = (module: any): boolean => {
  if (!module) return false
  
  // Check if module has content
  if (!module.contentIds || module.contentIds.length === 0) {
    return false
  }
  
  // Check if module has required content types
  if (module.contentType && !COURSE_BUSINESS_RULES.REQUIRED_MODULE_TYPES.includes(module.contentType)) {
    return false
  }
  
  return true
}

// Validate all modules in a course
export const validateCourseModules = async (courseId: string): Promise<ModuleValidationResult> => {
  try {
    const modules = await fetchModulos(courseId)
    const activeModules = modules.filter(m => m.status === 'active')
    const modulesWithContent = modules.filter(m => validateModule(m))
    
    const reasons: string[] = []
    const suggestions: string[] = []
    const recommendedModules: string[] = []
    
    // Check minimum active modules
    if (activeModules.length < COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES) {
      reasons.push(`El curso tiene menos de ${COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES} módulo(s) activo(s)`)
      suggestions.push(`Active al menos ${COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES} módulo(s) para activar el curso`)
    }
    
    // Check module content
    if (COURSE_BUSINESS_RULES.VALIDATE_MODULE_CONTENT) {
      const validModules = modules.filter(m => validateModule(m))
      if (validModules.length < COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES) {
        reasons.push('Los módulos no tienen suficiente contenido')
        suggestions.push('Agregue contenido a los módulos antes de activar el curso')
      }
    }
    
    // Recommend modules for activation
    if (activeModules.length === 0 && modules.length > 0) {
      // Recommend modules with content
      const contentModules = modules.filter(m => validateModule(m))
      if (contentModules.length > 0) {
        recommendedModules.push(...contentModules.slice(0, COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES).map(m => m.id))
        suggestions.push('Se recomienda activar los módulos con contenido')
      } else {
        // Recommend first modules if no content
        recommendedModules.push(...modules.slice(0, COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES).map(m => m.id))
        suggestions.push('Se recomienda agregar contenido a los módulos antes de activar')
      }
    }
    
    return {
      isValid: reasons.length === 0,
      canBeActivated: activeModules.length >= COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES,
      reasons,
      suggestions,
      moduleCount: modules.length,
      activeModuleCount: activeModules.length,
      modulesWithContent: modulesWithContent.length,
      recommendedModules
    }
  } catch (error) {
    logger.error('Error validando módulos del curso', { error, courseId })
    return {
      isValid: false,
      canBeActivated: false,
      reasons: ['Error al validar módulos del curso'],
      suggestions: ['Intente nuevamente más tarde'],
      moduleCount: 0,
      activeModuleCount: 0,
      modulesWithContent: 0,
      recommendedModules: []
    }
  }
}

// Check if course can be activated
export const checkCourseActivationEligibility = async (courseId: string): Promise<CourseActivationEligibility> => {
  const moduleValidation = await validateCourseModules(courseId)
  
  const requiredActions: string[] = []
  const modulesToActivate: string[] = []
  
  if (!moduleValidation.canBeActivated) {
    // Build required actions
    if (moduleValidation.activeModuleCount === 0 && moduleValidation.moduleCount > 0) {
      requiredActions.push('Activar módulos del curso')
      modulesToActivate.push(...moduleValidation.recommendedModules)
    }
    
    if (moduleValidation.modulesWithContent < COURSE_BUSINESS_RULES.MIN_ACTIVE_MODULES) {
      requiredActions.push('Agregar contenido a los módulos')
    }
    
    if (moduleValidation.moduleCount === 0) {
      requiredActions.push('Crear módulos para el curso')
    }
  }
  
  return {
    canActivate: moduleValidation.canBeActivated,
    reasons: moduleValidation.reasons,
    suggestions: moduleValidation.suggestions,
    requiredActions,
    autoActivationPossible: modulesToActivate.length > 0 && COURSE_BUSINESS_RULES.AUTO_SUGGEST_MODULE_ACTIVATION,
    modulesToActivate
  }
}

// Smart activation: automatically activate recommended modules
export const smartActivateCourse = async (
  courseId: string,
  toggleCursoActivo: (courseId: string, active: boolean) => Promise<any>,
  toggleModuloActivo: (courseId: string, moduleId: string, active: boolean) => Promise<any>
): Promise<{ success: boolean; message: string; autoActivatedModules: string[] }> => {
  try {
    const eligibility = await checkCourseActivationEligibility(courseId)
    
    if (eligibility.canActivate) {
      // Course can be activated directly
      await toggleCursoActivo(courseId, true)
      logger.info('Curso activado exitosamente', { courseId })
      
      return {
        success: true,
        message: 'Curso activado exitosamente',
        autoActivatedModules: []
      }
    }
    
    // Try auto-activation if possible
    if (eligibility.autoActivationPossible && eligibility.modulesToActivate.length > 0) {
      logger.info('Activando módulos automáticamente', { courseId, modules: eligibility.modulesToActivate })
      
      // Activate recommended modules
      await Promise.all(
        eligibility.modulesToActivate.map(moduleId => 
          toggleModuloActivo(courseId, moduleId, true)
        )
      )
      
      // Then activate the course
      await toggleCursoActivo(courseId, true)
      
      logger.info('Curso y módulos activados exitosamente', { courseId, moduleCount: eligibility.modulesToActivate.length })
      
      return {
        success: true,
        message: `Curso activado con ${eligibility.modulesToActivate.length} módulo(s) activado(s) automáticamente`,
        autoActivatedModules: eligibility.modulesToActivate
      }
    }
    
    // Cannot activate
    return {
      success: false,
      message: eligibility.reasons.join('. ') + '. ' + eligibility.suggestions.join('. '),
      autoActivatedModules: []
    }
  } catch (error) {
    logger.error('Error en activación inteligente del curso', { error, courseId })
    return {
      success: false,
      message: 'Error al activar el curso. Por favor intenta nuevamente.',
      autoActivatedModules: []
    }
  }
}

// Get activation suggestions for UI
export const getActivationSuggestions = async (courseId: string): Promise<{
  canActivate: boolean
  message: string
  suggestions: string[]
  showAutoActivateOption: boolean
  modulesToActivate: any[]
}> => {
  const eligibility = await checkCourseActivationEligibility(courseId)
  
  let message = ''
  if (eligibility.canActivate) {
    message = 'El curso está listo para activarse'
  } else {
    message = eligibility.reasons.join('. ')
  }
  
  return {
    canActivate: eligibility.canActivate,
    message,
    suggestions: eligibility.suggestions,
    showAutoActivateOption: eligibility.autoActivationPossible,
    modulesToActivate: eligibility.modulesToActivate
  }
}

// Validate course completeness
export const validateCourseCompleteness = async (courseId: string): Promise<{
  isComplete: boolean
  completenessScore: number
  missingElements: string[]
}> => {
  try {
    const modules = await fetchModulos(courseId)
    
    const missingElements: string[] = []
    let completenessScore = 0
    
    // Check if course has modules
    if (modules.length === 0) {
      missingElements.push('Módulos')
    } else {
      completenessScore += 30 // Has modules
    }
    
    // Check if modules have content
    const modulesWithContent = modules.filter(m => validateModule(m))
    if (modulesWithContent.length === 0) {
      missingElements.push('Contenido en módulos')
    } else {
      completenessScore += 30 // Has content
    }
    
    // Check if has active modules
    const activeModules = modules.filter(m => m.status === 'active')
    if (activeModules.length === 0) {
      missingElements.push('Módulos activos')
    } else {
      completenessScore += 20 // Has active modules
    }
    
    // Check if has required content types
    const hasRequiredTypes = modules.some(m => 
      COURSE_BUSINESS_RULES.REQUIRED_MODULE_TYPES.includes(m.contentType)
    )
    if (!hasRequiredTypes) {
      missingElements.push('Tipos de contenido requeridos')
    } else {
      completenessScore += 20 // Has required content types
    }
    
    return {
      isComplete: missingElements.length === 0,
      completenessScore,
      missingElements
    }
  } catch (error) {
    logger.error('Error validando completitud del curso', { error, courseId })
    return {
      isComplete: false,
      completenessScore: 0,
      missingElements: ['Error al validar completitud']
    }
  }
}
