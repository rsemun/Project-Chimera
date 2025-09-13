import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { color } = request.body;
    if (!['red', 'blue', 'yellow'].includes(color)) {
      return response.status(400).json({ message: 'Color inválido' });
    }
    
    const columnName = `color_${color}`;

    // Paso 1: Obtenemos los datos actuales de la memoria
    const { data: currentData, error: selectError } = await supabase
      .from('personality_core')
      .select('*') // Seleccionamos TODAS las columnas
      .eq('id', 1)
      .single();

    if (selectError) throw selectError;

    // Paso 2: Calculamos el nuevo valor
    const newValue = currentData[columnName] + 1;

    // Paso 3: Actualizamos la memoria
    const { data: updatedData, error: updateError } = await supabase
      .from('personality_core')
      .update({ [columnName]: newValue })
      .eq('id', 1)
      .select() // ¡NUEVO! Le pedimos que nos devuelva la fila actualizada
      .single();

    if (updateError) throw updateError;
    
    // Paso 4: Respondemos con un mensaje y el estado completo de la personalidad
    return response.status(200).json({ 
        message: `Memoria actualizada`,
        personality: {
            red: updatedData.color_red,
            blue: updatedData.color_blue,
            yellow: updatedData.color_yellow
        }
    });

  } catch (error) {
    console.error('Error en la función API:', error);
    return response.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}