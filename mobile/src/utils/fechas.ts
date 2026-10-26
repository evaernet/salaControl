// Las fechas llegan de la API como "2022-03-10" o "2026-10-26 15:30" (hora de Argentina).
// Se arman a mano para que no las corra la zona horaria del celular.
function aFecha(texto: string): Date {
  const [anio, mes, dia] = texto.slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

// "2026-10-26 15:30" -> fecha con hora.
export function aFechaHora(texto: string): Date {
  const fecha = aFecha(texto);
  const [hora, minutos] = (texto.slice(11, 16) || '00:00').split(':').map(Number);
  fecha.setHours(hora, minutos);
  return fecha;
}

export const UN_DIA = 24 * 60 * 60 * 1000;

// Edad para pediatría: días si es recién nacido, meses hasta los 2 años, después años.
export function edad(fechaNacimiento: string): string {
  const nacimiento = aFecha(fechaNacimiento);
  const hoy = new Date();

  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses--;

  if (meses < 1) {
    const dias = Math.floor((hoy.getTime() - nacimiento.getTime()) / UN_DIA);
    return dias === 1 ? '1 día' : `${dias} días`;
  }
  if (meses < 24) return meses === 1 ? '1 mes' : `${meses} meses`;
  return `${Math.floor(meses / 12)} años`;
}

// El día que ingresa es el día 1.
export function diaDeInternacion(fechaIngreso: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((hoy.getTime() - aFecha(fechaIngreso).getTime()) / UN_DIA) + 1;
}

// "2022-03-10" -> "10/03/2022"; si trae hora, la agrega: "26/10/2026 15:30"
export function fechaLegible(texto: string): string {
  const [anio, mes, dia] = texto.slice(0, 10).split('-');
  const hora = texto.slice(11, 16);
  return `${dia}/${mes}/${anio}${hora ? ` ${hora}` : ''}`;
}
