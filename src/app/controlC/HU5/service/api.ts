const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const MODIFICAR_DATOS_BASE = '/api/controlC/modificar-datos';

export interface User {
  email: string;
  name?: string;
  picture?: string;
  telefono?: string;
  ubicacion?: Ubicacion;
}

export interface UpdateRequesterData {
  telefono: string;
  ubicacion: Ubicacion;
}
export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
  departamento: string;
  pais: string;
}

export interface RequesterData {
  requesterId: string;
  telefono: string;
  ubicacion: Ubicacion;
}

export async function obtenerDatosUsuarioLogueado(): Promise<RequesterData> {
  const token = localStorage.getItem('servineo_token');

  if (!token) {
    throw new Error('No se encontró token de autenticación.');
  }

  try {
    const fullUrl = `${BASE_URL}${MODIFICAR_DATOS_BASE}/requester/data`;

    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: No se pudo cargar el perfil.`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    throw error;
  }
}

export async function actualizarDatosUsuario(
  data: UpdateRequesterData
): Promise<{ success: boolean; message?: string; code?: string }> {
  const token = localStorage.getItem('servineo_token');

  if (!token) {
    return { success: false, message: 'No autenticado.' };
  }

  try {
    const fullUrl = `${BASE_URL}${MODIFICAR_DATOS_BASE}/requester/update-profile`;

    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json().catch(() => ({}));

    if (res.status === 409 && responseData?.error === 'PHONE_TAKEN') {
      return {
        success: false,
        message: responseData.message || 'Número ya registrado',
        code: 'PHONE_TAKEN',
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: responseData.message || `Error ${res.status}: No se pudo actualizar.`,
      };
    }

    return { success: true, message: 'Perfil actualizado con éxito.' };
  } catch (error: unknown) {
    console.error('Error al actualizar el perfil:', error);
    let message = 'Fallo en la conexión o servidor.';
    if (error instanceof Error) {
      message = error.message || message;
    }
    return { success: false, message };
  }
}
