import * as React from "react";

// Punto de quiebre (px) usado para considerar la vista como móvil
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Inicialmente undefined hasta que effect ejecute y establezca el valor real
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // MediaQuery que detecta anchos estrictamente menores al breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler: actualiza el estado basándose en el ancho real de la ventana
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpieza: remover el listener al desmontar
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Aseguramos que el hook siempre devuelva un booleano
  return !!isMobile;
}
