import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { definedSectionRole } from "../components/SidebarSections";
import { Section } from "../types/Sidebar.types";
import { useHiddenNavStore } from "../store/hiddenNavStore";

const SidebarNavigation = () => {

    const navigate = useNavigate();
    const location = useLocation();
    
    const [sectionSelected, setSectionSelected] = useState("Dashboard");
    const [actuallySection, setActuallySection] = useState<Section[]>([]);
    const hiddenNav = useHiddenNavStore((state) => state.hiddenNav);

    useEffect(() => {
        const sectionByRol = definedSectionRole();
        setActuallySection(sectionByRol);

        const currentSection = sectionByRol.find(section => 
            location.pathname.startsWith(section.path)
        );
        
        if (currentSection) {
            setSectionSelected(currentSection.label);
        }
    }, [location.pathname]);

    const handleNavigationClick = (label: string, path: string) => {
        setSectionSelected(label);
        navigate(path);
    };

    return (
        <div className="px-2 py-2">
        {actuallySection.map((v, i) => (
            <Tooltip key={i} describeChild arrow
                title={v.label}
                placement="right"
                disableHoverListener={!hiddenNav}
            >
            <nav onClick={() => handleNavigationClick(v.label, v.path)}
                className={`flex items-center px-3 py-2.5 mx-1 rounded-xl cursor-pointer transition-all ${
                sectionSelected === v.label ? "bg-white/15 shadow-sm"
                    : "hover:bg-white/10 opacity-80 hover:opacity-100 bg-transparent"
                }`}
            >
                <div className={`flex items-center transition-all`}
                    style={{
                        color:
                        sectionSelected === v.label
                            ? "var(--color-text-on-dark)"
                            : "rgba(255, 255, 255, 0.8)",
                    }}
                    >
                    {v.icon}
                </div>

                {!hiddenNav && (
                    <h1 className={`text-sm font-semibold px-3 transition-all`}
                        style={{
                        color:
                            sectionSelected === v.label
                            ? "var(--color-text-on-dark)"
                            : "rgba(255, 255, 255, 0.8)",
                        }}
                    >
                        {v.label}
                    </h1>
                )}
            </nav>
            </Tooltip>
        ))}
        </div>
    );
};

export default SidebarNavigation;
