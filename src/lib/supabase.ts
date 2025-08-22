import 'server-only';
import { supabaseAdmin } from './supabase-admin';


export interface User {
  id: string;
  email: string;
  code: string;
  plan: string;
  credits: number;
  login_date: string;
  last_activity: string;
  session_token: string;
  created_at: string;
}

export interface Blacklist {
  id: string;
  email: string;
  ip_address: string;
  reason: string;
  created_at: string;
}

// Service de base de données simplifié et robuste
export class DatabaseService {
  
  // ===== SYSTÈME DE BLACKLIST ROBUSTE =====
  
  // Vérifier si un utilisateur est blacklisté (email OU IP)
  static async isBlacklisted(email: string, ipAddress: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification blacklist:', { email, ipAddress });
      
      // Vérifier par email
      const { data: emailCheck, error: emailError } = await supabaseAdmin
        .from('blacklist')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (emailError) {
        console.error('❌ Erreur vérification blacklist email:', emailError);
      }

      if (emailCheck) {
        console.log('🚫 Utilisateur blacklisté par email:', emailCheck);
        return true;
      }

      // Vérifier par IP
      const { data: ipCheck, error: ipError } = await supabaseAdmin
        .from('blacklist')
        .select('*')
        .eq('ip_address', ipAddress)
        .maybeSingle();

      if (ipError) {
        console.error('❌ Erreur vérification blacklist IP:', ipError);
      }

      if (ipCheck) {
        console.log('🚫 Utilisateur blacklisté par IP:', ipCheck);
        return true;
      }

      console.log('✅ Utilisateur non blacklisté');
      return false;
    } catch (error) {
      console.error('💥 Exception vérification blacklist:', error);
      return false;
    }
  }

  // Blacklister un utilisateur (email ET IP)
  static async blacklistUser(email: string, ipAddress: string, reason: string): Promise<void> {
    try {
      console.log('🚫 Blacklistage utilisateur:', { email, ipAddress, reason });
      
      // Vérifier si déjà blacklisté
      const alreadyBlacklisted = await this.isBlacklisted(email, ipAddress);
      if (alreadyBlacklisted) {
        console.log('⚠️ Utilisateur déjà blacklisté');
        return;
      }

      // Insérer dans la blacklist
      const { error } = await supabaseAdmin
        .from('blacklist')
        .insert([{
          email,
          ip_address: ipAddress,
          reason,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('❌ Erreur blacklistage:', error);
        throw new Error(`Erreur blacklistage: ${error.message}`);
      }
      console.log('✅ Utilisateur blacklisté avec succès');
    } catch (error) {
      console.error('💥 Exception blacklistage:', error);
      throw error;
    }
  }

  // Blacklister automatiquement un utilisateur de test avec 0 crédits
  static async autoBlacklistTestUser(userId: string, userIp: string): Promise<void> {
    try {
      console.log('🔄 Blacklistage automatique utilisateur de test:', userId);
      
      // Récupérer les données utilisateur
      const { data: user, error } = await supabaseAdmin
        .from('usersmvp')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Erreur récupération utilisateur pour blacklist:', error);
        return;
      }

      // Vérifier si c'est un utilisateur de test avec 0 crédits
      if (user.code === 'IMMOPIXTESTMVP07' && user.credits <= 0) {
        console.log('🚫 Blacklistage automatique - crédits épuisés');
        await this.blacklistUser(user.email, userIp, 'Crédits de test épuisés');
      }
    } catch (error) {
      console.error('💥 Exception blacklistage automatique:', error);
    }
  }

  // ===== GESTION DES UTILISATEURS =====
  
  // Créer ou mettre à jour un utilisateur
  static async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    try {
      console.log('👤 Création/mise à jour utilisateur:', { email: userData.email, code: userData.code });
      
      // Vérifier si l'utilisateur existe déjà avec ce code
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('usersmvp')
        .select('*')
        .eq('email', userData.email)
        .eq('code', userData.code)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur vérification utilisateur existant:', checkError);
        throw new Error(`Erreur DB (vérification): ${checkError.message}`);
      }

      if (existingUser) {
        console.log('🔄 Utilisateur existant trouvé, mise à jour...');
        console.log('💰 Crédits existants:', existingUser.credits);
        
        // Si l'utilisateur existe avec ce code, le mettre à jour MAIS conserver les crédits existants
        const { data, error } = await supabaseAdmin
          .from('usersmvp')
          .update({
            // Ne pas remettre les crédits, conserver ceux existants
            plan: userData.plan,
            login_date: userData.login_date,
            last_activity: userData.last_activity,
            session_token: userData.session_token
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur mise à jour utilisateur:', error);
          throw new Error(`Erreur mise à jour utilisateur: ${error.message}`);
        }
        console.log('✅ Utilisateur mis à jour avec succès (crédits conservés):', data);
        return data;
      } else {
        console.log('🆕 Création nouvel utilisateur...');
        // Créer un nouvel utilisateur avec les crédits du code
        const { data, error } = await supabaseAdmin
          .from('usersmvp')
          .insert([userData])
          .select()
          .single();

        if (error) {
          console.error('❌ Erreur création utilisateur:', error);
          throw new Error(`Erreur création utilisateur: ${error.message}`);
        }
        console.log('✅ Nouvel utilisateur créé avec succès:', data);
        return data;
      }
    } catch (error) {
      console.error('💥 Exception createUser:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par token de session
  static async getUserByToken(token: string): Promise<User | null> {
    try {
      console.log('🔍 Récupération utilisateur par token:', token);
      const { data, error } = await supabaseAdmin
        .from('usersmvp')
        .select('*')
        .eq('session_token', token)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur récupération utilisateur par token:', error);
        return null;
      }

      console.log('✅ Utilisateur trouvé:', data ? 'Oui' : 'Non');
      return data;
    } catch (error) {
      console.error('💥 Exception getUserByToken:', error);
      return null;
    }
  }

  // Récupérer email et crédits d'un utilisateur
  static async getUserEmailAndCredits(userId: string): Promise<{ email: string; credits: number } | null> {
    try {
      console.log('🔍 Récupération email/credits pour:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('usersmvp')
        .select('email, credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération email/credits:', error);
        return null;
      }

      console.log('✅ Email/credits récupérés:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception récupération email/credits:', error);
      return null;
    }
  }

  // Récupérer toutes les données utilisateur
  static async getUserData(userId: string): Promise<{ email: string; credits: number; plan: string } | null> {
    try {
      console.log('🔍 Récupération données complètes pour:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('usersmvp')
        .select('email, credits, plan')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération données utilisateur:', error);
        return null;
      }

      console.log('✅ Données utilisateur récupérées:', data);
      return data;
    } catch (error) {
      console.error('💥 Exception récupération données utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour les crédits d'un utilisateur
  static async updateCredits(userId: string, credits: number): Promise<void> {
    try {
      console.log('💰 Mise à jour crédits:', { userId, credits });
      const { error } = await supabaseAdmin
        .from('usersmvp')
        .update({ credits, last_activity: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur mise à jour crédits:', error);
        throw new Error(`Erreur mise à jour crédits: ${error.message}`);
      }
      console.log('✅ Crédits mis à jour avec succès');
    } catch (error) {
      console.error('💥 Exception updateCredits:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière activité d'un utilisateur
  static async updateLastActivity(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('usersmvp')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur mise à jour activité:', error);
        throw new Error(`Erreur mise à jour activité: ${error.message}`);
      }
    } catch (error) {
      console.error('💥 Exception updateLastActivity:', error);
      throw error;
    }
  }

  // Consommer un crédit avec blacklist automatique
  static async consumeCredit(userId: string, userIp?: string): Promise<boolean> {
    try {
      console.log('💳 Consommation crédit pour utilisateur:', userId, 'IP:', userIp);
      
      // Récupérer les crédits actuels
      const user = await this.getUserEmailAndCredits(userId);
      if (!user || user.credits <= 0) {
        console.log('❌ Aucun crédit disponible');
        return false;
      }

      // Décrémenter les crédits
      await this.updateCredits(userId, user.credits - 1);
      console.log('✅ Crédit consommé, reste:', user.credits - 1);
      
      // Vérifier si c'est le dernier crédit d'un utilisateur de test
      if (user.credits - 1 === 0 && userIp) {
        console.log('🚫 Dernier crédit consommé - blacklistage automatique');
        await this.autoBlacklistTestUser(userId, userIp);
      }
      
      return true;
    } catch (error) {
      console.error('💥 Exception consumeCredit:', error);
      return false;
    }
  }

  // Invalider une session
  static async invalidateSession(token: string): Promise<void> {
    try {
      console.log('🔓 Invalidation session:', token);
      const { error } = await supabaseAdmin
        .from('usersmvp')
        .update({ session_token: null })
        .eq('session_token', token);

      if (error) {
        console.error('❌ Erreur invalidation session:', error);
        throw new Error(`Erreur invalidation session: ${error.message}`);
      }
      console.log('✅ Session invalidée avec succès');
    } catch (error) {
      console.error('💥 Exception invalidateSession:', error);
      throw error;
    }
  }
}