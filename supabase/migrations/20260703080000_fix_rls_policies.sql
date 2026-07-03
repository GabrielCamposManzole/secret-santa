-- Migration: 20260703080000_fix_rls_policies.sql
-- Refinamento das políticas de Row Level Security (RLS) para permitir que os usuários busquem, adicionem e listem membros em comum de forma correta.

-- 1. Tabela: public.usuarios
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o proprio usuario" ON public.usuarios;

CREATE POLICY "Permitir select de usuarios para autenticados" ON public.usuarios
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert para autenticados" ON public.usuarios
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update apenas para o proprio usuario" ON public.usuarios
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir delete apenas para o proprio usuario" ON public.usuarios
    FOR DELETE TO authenticated USING (auth.uid() = id);


-- 2. Tabela: public.grupos
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o dono do grupo" ON public.grupos;

CREATE POLICY "Permitir select de grupos para autenticados" ON public.grupos
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de grupos para autenticados" ON public.grupos
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir update de grupos apenas para o dono" ON public.grupos
    FOR UPDATE TO authenticated USING (auth.uid() = dono_id) WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Permitir delete de grupos apenas para o dono" ON public.grupos
    FOR DELETE TO authenticated USING (auth.uid() = dono_id);


-- 3. Tabela: public.usuario_grupo (participacoes)
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o usuario da participacao" ON public.usuario_grupo;

CREATE POLICY "Permitir select de participacoes para autenticados" ON public.usuario_grupo
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR INSERT TO authenticated 
    WITH CHECK (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );

CREATE POLICY "Permitir update de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR UPDATE TO authenticated 
    USING (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    )
    WITH CHECK (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );

CREATE POLICY "Permitir delete de participacoes para o proprio usuario ou para o dono do grupo" ON public.usuario_grupo
    FOR DELETE TO authenticated 
    USING (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.grupos 
            WHERE grupos.id = grupo_id AND grupos.dono_id = auth.uid()
        )
    );


-- 4. Tabela: public.caracteristicas
DROP POLICY IF EXISTS "Permitir select, insert, update, delete apenas para o dono da caracteristica" ON public.caracteristicas;

CREATE POLICY "Permitir select de caracteristicas para autenticados" ON public.caracteristicas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Permitir update de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR UPDATE TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Permitir delete de caracteristicas apenas para o proprio usuario" ON public.caracteristicas
    FOR DELETE TO authenticated USING (usuario_id = auth.uid());
