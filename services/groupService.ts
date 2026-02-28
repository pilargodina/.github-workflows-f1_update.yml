import { supabase } from '@/lib/supabase';

// Función auxiliar para generar un código de invitación aleatorio (Ej: F1-XJ39)
const generateInviteCode = () => {
  return `F1-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

export const groupService = {
  // CREAR UN GRUPO
  async createGroup(name: string, adminId: string) {
    const inviteCode = generateInviteCode();

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([
        { 
          name, 
          admin_id: adminId, 
          invite_code: inviteCode 
        }
      ])
      .select()
      .single();

    if (groupError) throw groupError;

    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        { 
          group_id: group.id, 
          user_id: adminId 
        }
      ]);

    if (memberError) throw memberError;

    return group;
  },

  // UNIRSE A UN GRUPO
  async joinGroup(code: string, userId: string) {
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', code.trim().toUpperCase())
      .single();

    if (groupError || !group) throw new Error("Código de grupo no válido");

    const { error: joinError } = await supabase
      .from('group_members')
      .insert([
        { 
          group_id: group.id, 
          user_id: userId 
        }
      ]);

    if (joinError && joinError.code === '23505') {
       throw new Error("Ya eres miembro de este grupo");
    }

    if (joinError) throw joinError;

    return group;
  },

  // OBTENER RANKING DEL GRUPO (CORREGIDO PARA EVITAR PGRST200)
 async getGroupLeaderboard(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      user_id,
      profiles:user_id ( 
        username, 
        full_name,
        avatar_url,
        race_predictions ( 
          points_earned 
        )
      )
    `)
    .eq('group_id', groupId);

  if (error) throw error;

  return data.map((member: any) => {
    const p = member.profiles;
    // Buscamos un nombre válido: primero username, luego full_name, sino 'Piloto'
    const displayName = p?.username || p?.full_name || 'Piloto anonimo';
    
    const predictions = p?.race_predictions || [];
    const totalPoints = predictions.reduce(
      (acc: number, curr: any) => acc + (curr.points_earned || 0), 
      0
    );

    return {
      userId: member.user_id,
      username: displayName,
      avatarUrl: p?.avatar_url,
      totalPoints: totalPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
},
// En services/groupService.ts
async leaveOrDeleteGroup(groupId: string, userId: string, isAdmin: boolean) {
  if (isAdmin) {
    // Si es admin, borramos el grupo (las cascadas en SQL se encargan de los miembros)
    return await supabase.from('groups').delete().eq('id', groupId);
  } else {
    // Si es miembro, solo salimos de la tabla intermedia
    return await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  }
}
};