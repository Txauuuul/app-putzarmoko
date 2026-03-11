import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ message: 'Variables no configuradas' }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insertamos una fila aleatoria para generar actividad real de escritura
    const { error } = await supabase
      .from('keep_alive_logs')
      .insert({ ping_data: 'ping-' + Math.random().toString(36).substring(7) });

    if (error) {
      return NextResponse.json({ message: 'Error al escribir', error: error.message }, { status: 200 });
    }

    // Borramos registros de más de 7 días para no llenar la tabla
    await supabase
      .from('keep_alive_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({ message: 'Ping escrito con éxito' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Error controlado', error: String(err) }, { status: 200 });
  }
}
