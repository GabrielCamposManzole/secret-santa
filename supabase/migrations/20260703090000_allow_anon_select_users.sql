-- Migration: 20260703090000_allow_anon_select_users.sql
-- Substitui a política restrita de SELECT na tabela usuarios para permitir que qualquer papel (incluindo usuários anônimos) possa validar se um e-mail já existe.

DROP POLICY IF EXISTS "Permitir select de usuarios para autenticados" ON public.usuarios;

CREATE POLICY "Permitir select de usuarios para todos" ON public.usuarios
    FOR SELECT USING (true);
