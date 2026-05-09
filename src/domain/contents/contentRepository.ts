import { Content, ContentType } from './types'

export class ContentRepository {
  static getAllContents(): Content[] {
    return [
      {
        id: 'content-1',
        moduleId: 'module-1',
        title: 'What is JSX?',
        description: 'Intro to JSX syntax and how it maps to HTML.',
        type: ContentType.TEXT,
        status: 'active',
        resourceUrl: 'https://example.com/jsx-guide',
        durationMinutes: undefined,
        order: 1
      },
      {
        id: 'content-2',
        moduleId: 'module-1',
        title: 'Component Props',
        description: 'Learn how to pass data with props.',
        type: ContentType.VIDEO,
        status: 'active',
        resourceUrl: 'https://example.com/component-props-video',
        durationMinutes: 12,
        order: 2
      },
      {
        id: 'content-3',
        moduleId: 'module-2',
        title: 'useState Hook',
        description: 'Manage component state with useState.',
        type: ContentType.VIDEO,
        status: 'active',
        resourceUrl: 'https://example.com/usestate-video',
        durationMinutes: 15,
        order: 1
      },
      {
        id: 'content-4',
        moduleId: 'module-2',
        title: 'Event Handling',
        description: 'Handle clicks and form events in React.',
        type: ContentType.TEXT,
        status: 'draft',
        resourceUrl: 'https://example.com/event-handling-article',
        durationMinutes: undefined,
        order: 2
      },
      {
        id: 'content-5',
        moduleId: 'module-3',
        title: 'Primitive Types',
        description: 'Understand string, number and boolean in TypeScript.',
        type: ContentType.DOCUMENT,
        status: 'active',
        resourceUrl: 'https://example.com/primitives-guide.pdf',
        durationMinutes: undefined,
        order: 1
      },
      {
        id: 'content-6',
        moduleId: 'module-3',
        title: 'Union and Intersection Types',
        description: 'Build flexible type definitions.',
        type: ContentType.VIDEO,
        status: 'active',
        resourceUrl: 'https://example.com/union-intersection-video',
        durationMinutes: 14,
        order: 2
      },
      {
        id: 'content-7',
        moduleId: 'module-4',
        title: 'Generic Functions',
        description: 'Create reusable functions with generics.',
        type: ContentType.TEXT,
        status: 'active',
        resourceUrl: 'https://example.com/generic-functions-article',
        durationMinutes: undefined,
        order: 1
      },
      {
        id: 'content-8',
        moduleId: 'module-4',
        title: 'Generic Components',
        description: 'Use generics in React components.',
        type: ContentType.VIDEO,
        status: 'draft',
        resourceUrl: 'https://example.com/generic-components-video',
        durationMinutes: 13,
        order: 2
      }
    ]
  }

  static getContentsByModule(moduleId: string): Content[] {
    return this.getAllContents().filter((content) => content.moduleId === moduleId)
  }

  static getContentById(contentId: string): Content | undefined {
    return this.getAllContents().find((content) => content.id === contentId)
  }
}