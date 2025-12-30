/**
 * Configuración centralizada de colores para los bloques del timeline
 * Cada tipo de bloque tiene colores específicos para empleados actuales e históricos
 */

export interface IBlockColorConfig {
  currentEmployee: string;
  historicalEmployee: string;
  border?: string;
  text?: string;
}

export interface IBlockColors {
  [key: string]: IBlockColorConfig;
}

/**
 * Configuración de colores para diferentes tipos de bloques
 * Los colores están organizados por tipo de bloque (work, vacation, sick, etc.)
 */
export const BLOCK_COLORS: IBlockColors = {
  // Trabajo regular
  WORK: {
    currentEmployee: '#094a90', // Azul fuerte para empleados actuales
    historicalEmployee: 'rgba(9, 74, 144, 0.6)', // Azul tenue para empleados históricos
    border: '#063970',
    text: '#000000'
  },

  // Pausas/Descansos
  DESC: {
    currentEmployee: '#ff9d00ff', // Amarillo fuerte para empleados actuales
    historicalEmployee: 'rgba(225, 157, 12, 0.6)', // Amarillo tenue para empleados históricos
    border: '#ff9d00ff',
    text: '#000000'
  },
  // Tiempo libre/ausencia
  AUS: {
    currentEmployee: '#dc3545', // Rojo fuerte para empleados actuales
    historicalEmployee: 'rgba(220, 53, 69, 0.6)', // Rojo tenue para empleados históricos
    border: '#bd2130',
    text: '#000000'
  },

  SUS: {
    currentEmployee: '#dc3545', // Rojo fuerte para empleados actuales
    historicalEmployee: 'rgba(220, 53, 69, 0.6)', // Rojo tenue para empleados históricos
    border: '#bd2130',
    text: '#000000'
  },

  INC_ARL: {
    currentEmployee: '#e17474ff', // Rojo fuerte para empleados actuales
    historicalEmployee: 'rgba(213, 118, 128, 0.6)', // Rojo tenue para empleados históricos
    border: '#e17474ff',
    text: '#000000'
  },

  RET: {
    currentEmployee: '#1b7742ff', // Rojo fuerte para empleados actuales
    historicalEmployee: 'rgba(51, 182, 105, 0.6)', // Rojo tenue para empleados históricos
    border: '#1b7742ff',
    text: '#000000'
  },

  // Color por defecto para tipos no definidos
  default: {
    currentEmployee: '#efe418ff', // Gris fuerte para empleados actuales
    historicalEmployee: 'rgba(209, 237, 49, 0.6)', // Gris tenue para empleados históricos
    border: '#efe418ff',
    text: '#ffffff'
  }
};

/**
 * Función para obtener la configuración de colores de un tipo de bloque
 * @param blockType - El tipo de bloque (ej: 'work', 'vacation', 'sick')
 * @returns La configuración de colores para ese tipo de bloque
 */
export const getBlockColorConfig = (blockType: string): IBlockColorConfig => {
  return BLOCK_COLORS[blockType] || BLOCK_COLORS.default;
};

/**
 * Función para obtener el color de fondo de un bloque
 * @param blockType - El tipo de bloque
 * @param isCurrentEmployee - Si es el empleado actual asignado
 * @returns El color de fondo apropiado
 */
export const getBlockBackgroundColor = (blockType: string, isCurrentEmployee: boolean): string => {
  const config = getBlockColorConfig(blockType);
  return isCurrentEmployee ? config.currentEmployee : config.historicalEmployee;
};

/**
 * Función para obtener el color del borde de un bloque
 * @param blockType - El tipo de bloque
 * @returns El color del borde apropiado
 */
export const getBlockBorderColor = (blockType: string): string => {
  const config = getBlockColorConfig(blockType);
  return config.border || config.currentEmployee;
};

/**
 * Función para obtener el color del texto de un bloque
 * @param blockType - El tipo de bloque
 * @returns El color del texto apropiado
 */
export const getBlockTextColor = (blockType: string): string => {
  const config = getBlockColorConfig(blockType);
  return config.text || '#ffffff';
};

/**
 * Función para obtener todos los tipos de bloque disponibles
 * @returns Array con los nombres de los tipos de bloque
 */
export const getAvailableBlockTypes = (): string[] => {
  return Object.keys(BLOCK_COLORS).filter(key => key !== 'default');
};