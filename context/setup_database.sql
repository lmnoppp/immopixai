-- Configuration SQL pour Supabase - ImmoPix AI
-- Système complet avec usersmvp, blacklist et fonctions optimisées
-- Version mise à jour avec toutes les fonctionnalités actuelles

-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS image_processing CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS blacklist CASCADE;
DROP TABLE IF EXISTS usersmvp CASCADE;

-- Table principale des utilisateurs
-- Gestion complète des sessions, crédits, plans d'abonnement et authentification
CREATE TABLE usersmvp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  login_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de blacklist pour les utilisateurs de test
-- Protection automatique contre l'abus des codes de test (email + IP)
CREATE TABLE blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
-- Amélioration des temps de réponse pour l'authentification et les requêtes
CREATE INDEX idx_usersmvp_email ON usersmvp(email);
CREATE INDEX idx_usersmvp_code ON usersmvp(code);
CREATE INDEX idx_usersmvp_session_token ON usersmvp(session_token);
CREATE INDEX idx_usersmvp_last_activity ON usersmvp(last_activity);
CREATE INDEX idx_blacklist_email ON blacklist(email);
CREATE INDEX idx_blacklist_ip ON blacklist(ip_address);

-- Index composite pour les requêtes fréquentes
CREATE INDEX idx_usersmvp_email_code ON usersmvp(email, code);
CREATE INDEX idx_blacklist_email_ip ON blacklist(email, ip_address);

-- Activer Row Level Security
-- Sécurité au niveau des lignes pour Supabase
ALTER TABLE usersmvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simplifiées
-- Accès complet pour l'application (gestion côté application)
CREATE POLICY "Enable all access for usersmvp" ON usersmvp FOR ALL USING (true);
CREATE POLICY "Enable all access for blacklist" ON blacklist FOR ALL USING (true);

-- Insérer des utilisateurs de test
-- Codes d'accès avec crédits correspondants selon l'implémentation actuelle
INSERT INTO usersmvp (email, code, plan, credits, session_token) VALUES
('test@example.com', 'IMMOPIXTESTMVP07', 'test', 3, NULL),
('demo@example.com', 'IMMO-STARTER-2025', 'starter', 40, NULL),
('demo@example.com', 'IMMO-CONFORT-2025', 'confort', 150, NULL),
('demo@example.com', 'IMMO-PROMAX-2025', 'promax', 300, NULL);

-- Fonction de nettoyage des sessions expirées
-- À exécuter manuellement ou via cron job pour maintenir la performance
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE usersmvp 
  SET session_token = NULL 
  WHERE last_activity < NOW() - INTERVAL '24 hours';
  
  -- Log du nettoyage
  RAISE NOTICE 'Sessions expirées nettoyées à %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction de vérification de blacklist
-- Utilisée pour vérifier si un utilisateur est bloqué (email OU IP)
CREATE OR REPLACE FUNCTION is_user_blacklisted(user_email VARCHAR, user_ip VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blacklist 
    WHERE email = user_email OR ip_address = user_ip
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction de blacklistage automatique
-- Utilisée pour blacklister automatiquement les utilisateurs de test
CREATE OR REPLACE FUNCTION auto_blacklist_test_user(user_email VARCHAR, user_ip VARCHAR, reason TEXT)
RETURNS void AS $$
BEGIN
  -- Vérifier si déjà blacklisté
  IF NOT EXISTS (
    SELECT 1 FROM blacklist 
    WHERE email = user_email OR ip_address = user_ip
  ) THEN
    -- Insérer dans la blacklist
    INSERT INTO blacklist (email, ip_address, reason, created_at)
    VALUES (user_email, user_ip, reason, NOW());
    
    RAISE NOTICE 'Utilisateur blacklisté automatiquement: % (IP: %) - Raison: %', user_email, user_ip, reason;
  ELSE
    RAISE NOTICE 'Utilisateur déjà blacklisté: % (IP: %)', user_email, user_ip;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction de mise à jour des crédits avec vérification
-- Utilisée pour consommer des crédits de manière sécurisée
CREATE OR REPLACE FUNCTION consume_user_credit(user_id UUID, user_ip VARCHAR DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  user_email VARCHAR;
  user_code VARCHAR;
BEGIN
  -- Récupérer les crédits actuels et les informations utilisateur
  SELECT credits, email, code INTO current_credits, user_email, user_code
  FROM usersmvp 
  WHERE id = user_id;
  
  -- Vérifier si l'utilisateur existe et a des crédits
  IF current_credits IS NULL THEN
    RAISE NOTICE 'Utilisateur non trouvé: %', user_id;
    RETURN FALSE;
  END IF;
  
  IF current_credits <= 0 THEN
    RAISE NOTICE 'Aucun crédit disponible pour l''utilisateur: %', user_id;
    RETURN FALSE;
  END IF;
  
  -- Décrémenter les crédits
  UPDATE usersmvp 
  SET credits = credits - 1, last_activity = NOW()
  WHERE id = user_id;
  
  -- Vérifier si c'est le dernier crédit d'un utilisateur de test
  IF current_credits - 1 = 0 AND user_code = 'IMMOPIXTESTMVP07' AND user_ip IS NOT NULL THEN
    PERFORM auto_blacklist_test_user(user_email, user_ip, 'Crédits de test épuisés');
  END IF;
  
  RAISE NOTICE 'Crédit consommé pour l''utilisateur: % (reste: %)', user_id, current_credits - 1;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction de création/mise à jour d'utilisateur
-- Utilisée lors de la connexion pour gérer les nouveaux et existants
CREATE OR REPLACE FUNCTION create_or_update_user(
  user_email VARCHAR,
  user_code VARCHAR,
  user_plan VARCHAR,
  user_credits INTEGER,
  user_session_token VARCHAR
)
RETURNS usersmvp AS $$
DECLARE
  existing_user usersmvp;
  result_user usersmvp;
BEGIN
  -- Vérifier si l'utilisateur existe déjà avec ce code
  SELECT * INTO existing_user
  FROM usersmvp
  WHERE email = user_email AND code = user_code;
  
  IF existing_user IS NOT NULL THEN
    -- Utilisateur existant : mise à jour mais conservation des crédits
    UPDATE usersmvp 
    SET plan = user_plan,
        login_date = NOW(),
        last_activity = NOW(),
        session_token = user_session_token
    WHERE id = existing_user.id
    RETURNING * INTO result_user;
    
    RAISE NOTICE 'Utilisateur mis à jour: % (crédits conservés: %)', user_email, existing_user.credits;
  ELSE
    -- Nouvel utilisateur : création avec les crédits du code
    INSERT INTO usersmvp (email, code, plan, credits, login_date, last_activity, session_token)
    VALUES (user_email, user_code, user_plan, user_credits, NOW(), NOW(), user_session_token)
    RETURNING * INTO result_user;
    
    RAISE NOTICE 'Nouvel utilisateur créé: % (crédits: %)', user_email, user_credits;
  END IF;
  
  RETURN result_user;
END;
$$ LANGUAGE plpgsql;

-- Fonction de statistiques utilisateurs
-- Utilisée pour le monitoring et les analytics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  test_users BIGINT,
  total_blacklisted BIGINT,
  total_credits_used BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_activity > NOW() - INTERVAL '24 hours' THEN 1 END) as active_users,
    COUNT(CASE WHEN code = 'IMMOPIXTESTMVP07' THEN 1 END) as test_users,
    (SELECT COUNT(*) FROM blacklist) as total_blacklisted,
    (SELECT SUM(40 - credits) FROM usersmvp WHERE code = 'IMMO-STARTER-2025') +
    (SELECT SUM(150 - credits) FROM usersmvp WHERE code = 'IMMO-CONFORT-2025') +
    (SELECT SUM(300 - credits) FROM usersmvp WHERE code = 'IMMO-PROMAX-2025') +
    (SELECT SUM(3 - credits) FROM usersmvp WHERE code = 'IMMOPIXTESTMVP07') as total_credits_used;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour la maintenance automatique
-- Nettoyage automatique des sessions expirées

-- Trigger pour nettoyer les sessions expirées lors des insertions
CREATE OR REPLACE FUNCTION trigger_cleanup_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Nettoyer les sessions expirées
  PERFORM cleanup_expired_sessions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_sessions_trigger
  AFTER INSERT ON usersmvp
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_sessions();

-- Vues pour faciliter les requêtes fréquentes
-- Vue des utilisateurs actifs
CREATE VIEW active_users AS
SELECT id, email, plan, credits, last_activity
FROM usersmvp
WHERE last_activity > NOW() - INTERVAL '24 hours'
AND session_token IS NOT NULL;

-- Vue des utilisateurs de test
CREATE VIEW test_users AS
SELECT id, email, credits, last_activity
FROM usersmvp
WHERE code = 'IMMOPIXTESTMVP07';

-- Vue des utilisateurs blacklistés
CREATE VIEW blacklisted_users AS
SELECT email, ip_address, reason, created_at
FROM blacklist
ORDER BY created_at DESC;

-- Messages de confirmation
SELECT 'Base de données ImmoPix AI configurée avec succès!' as status;
SELECT 'Fonctionnalités incluses :' as features;
SELECT '- Système d''authentification complet' as feature1;
SELECT '- Gestion des crédits avec blacklist automatique' as feature2;
SELECT '- Sessions sécurisées avec expiration' as feature3;
SELECT '- Fonctions de maintenance automatique' as feature4;
SELECT '- Index optimisés pour les performances' as feature5;
SELECT '- Vues pour les requêtes fréquentes' as feature6; 

-- Table pour la galerie d'images utilisateur
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usersmvp(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prompt_used TEXT NOT NULL,
    option_applied TEXT NOT NULL,
    original_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_created ON gallery_images(user_id, created_at DESC);

-- RLS pour la galerie
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Politique RLS : chaque utilisateur ne voit que ses propres images
CREATE POLICY "Users can view their own gallery images" ON gallery_images
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own gallery images" ON gallery_images
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own gallery images" ON gallery_images
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own gallery images" ON gallery_images
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Fonction pour ajouter une image à la galerie
CREATE OR REPLACE FUNCTION add_image_to_gallery(
    p_user_id UUID,
    p_image_url TEXT,
    p_prompt_used TEXT,
    p_option_applied TEXT,
    p_original_image_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_image_id UUID;
BEGIN
    INSERT INTO gallery_images (user_id, image_url, prompt_used, option_applied, original_image_url)
    VALUES (p_user_id, p_image_url, p_prompt_used, p_option_applied, p_original_image_url)
    RETURNING id INTO new_image_id;
    
    RETURN new_image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les images d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_gallery_images(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    prompt_used TEXT,
    option_applied TEXT,
    original_image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gi.id,
        gi.image_url,
        gi.created_at,
        gi.prompt_used,
        gi.option_applied,
        gi.original_image_url
    FROM gallery_images gi
    WHERE gi.user_id = p_user_id
    ORDER BY gi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour une image dans la galerie
CREATE OR REPLACE FUNCTION update_gallery_image(
    p_image_id UUID,
    p_user_id UUID,
    p_new_image_url TEXT,
    p_new_prompt_used TEXT,
    p_new_option_applied TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE gallery_images 
    SET 
        image_url = p_new_image_url,
        prompt_used = p_new_prompt_used,
        option_applied = p_new_option_applied,
        updated_at = NOW()
    WHERE id = p_image_id AND user_id = p_user_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour faciliter les requêtes
CREATE OR REPLACE VIEW user_gallery_view AS
SELECT 
    gi.id,
    gi.user_id,
    gi.image_url,
    gi.created_at,
    gi.prompt_used,
    gi.option_applied,
    gi.original_image_url,
    u.email,
    u.credits
FROM gallery_images gi
JOIN usersmvp u ON gi.user_id = u.id;

-- Confirmation de la mise à jour
SELECT 'Galerie utilisateur ajoutée avec succès !' as confirmation; 