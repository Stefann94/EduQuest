-- Quiz-uri de exersare pentru toți elevii (pagina Quiz-uri), separate de quiz-urile
-- lecțiilor din curs. Se încarcă din content/ cu pnpm db:content.
alter type public.quiz_kind add value if not exists 'practice';
