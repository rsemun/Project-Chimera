// Importamos la herramienta para hablar con Supabase
import { createClient } from '@supabase/supabase-js';

// Creamos la conexión segura usando las llaves que guardamos en Vercel
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Esta es la función que Vercel ejecutará. Es nuestro "empleado de confianza".
export default async function handler(request, response) {
  // Solo permitimos que nos "hablen" con el método POST por seguridad
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // 1. Leemos el color que nos envía la página web
    const { color } = request.body;
    if (!['red', 'blue', 'yellow'].includes(color)) {
      return response.status(400).json({ message: 'Color inválido' });
    }
    
    const columnName = `color_${color}`;

    // 2. Obtenemos los datos actuales de la memoria de Chimera
    //    Asumimos que Chimera es la fila con id = 1
    const { data: currentData, error: selectError } = await supabase
      .from('personality_core')
      .select(columnName)
      .eq('id', 1)
      .single();

    if (selectError) throw selectError;

    // 3. Calculamos el nuevo valor (el valor actual + 1)
    const newValue = currentData[columnName] + 1;

    // 4. Actualizamos la memoria con el nuevo valor
    const { error: updateError } = await supabase
      .from('personality_core')
      .update({ [columnName]: newValue })
      .eq('id', 1);

    if (updateError) throw updateError;
    
    // 5. Respondemos que todo ha ido bien
    return response.status(200).json({ message: `Memoria actualizada: ${color} ahora es ${newValue}` });

  } catch (error) {
    // Si algo sale mal, enviamos un error
    console.error('Error en la función API:', error);
    return response.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}