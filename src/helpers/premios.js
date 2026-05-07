

export const formatPremio = (premio) => {

  switch (premio) {
    case 9999.9:
      return "2 Boletas gratis";
      break;
    case 59999.9:
      return "Un pack de skol";
      break;
    default:
      return `${premio?.toLocaleString('en-US').replace(/,/g, '.')} ${premio ? 'Mil' : ''}`
      break;
  }
}