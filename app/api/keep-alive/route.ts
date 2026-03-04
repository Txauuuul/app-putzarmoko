import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Forzamos que la ruta sea dinámica para evitar errores en tiempo de compilación
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 2. Verificación de seguridad con retorno claro
    if (!supabaseUrl || !supabaseKey) {
      console.error("Faltan variables de entorno");
      return NextResponse.json(
        { message: 'Variables no configuradas' },
        { status: 200 } // Usamos 200 para que el build de Vercel no falle
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 3. Consulta simplificada a 'votes'. 
    // Usamos .maybeSingle() para que no explote si la tabla está vacía
    const { error } = await supabase
      .from('votes')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Error de consulta (pero la señal llegó):", error.message);
      // Aunque haya error de tabla, la base de datos YA se ha despertado al recibir la petición
      return NextResponse.json({ message: 'Señal enviada con avisos' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Supabase despertado con éxito' }, { status: 200 });

  } catch (err) {
    // 4. Captura de errores catastróficos para que Vercel nunca devuelva un 500
    return NextResponse.json(
      { message: 'Error interno controlado', error: String(err) },
      { status: 200 }
    );
  }
}
