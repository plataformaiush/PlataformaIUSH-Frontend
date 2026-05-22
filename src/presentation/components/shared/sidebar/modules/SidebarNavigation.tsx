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
        <div>
        {actuallySection.map((v, i) => (
            <Tooltip key={i} describeChild arrow
                title={v.label}
                placement="right"
                disableHoverListener={!hiddenNav}
            >
            <nav onClick={() => handleNavigationClick(v.label, v.path)}
                className={`flex items-center p-3 m-2 rounded-[7px] cursor-pointer transition-all ${
                sectionSelected === v.label ? "opacity-100 bg-black/20"
                    : "hover:bg-black/20 hover:opacity-80 opacity-70 bg-transparent"
                }`}
            >
                <div className={`flex items-center transition-all`}
                    style={{
                        color:
                        sectionSelected === v.label
                            ? "var(--color-text-on-dark)"
                            : "var(--color-foreground)",
                    }}
                    >
                    {v.icon}
                </div>

                {!hiddenNav && (
                    <h1 className={`text-[13px] font-semibold px-2 mb-1 tracking-widest transition-all`}
                        style={{
                        color:
                            sectionSelected === v.label
                            ? "var(--color-text-on-dark)"
                            : "var(--color-foreground)",
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
