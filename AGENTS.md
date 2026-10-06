<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Keep the frontend-only product simulation in typed local React state so future data services can replace mock repositories without changing presentation components.
- Organize feature UI by dashboard and editor domains, with shared controls in `src/components/ui`, to preserve clear boundaries as the prototype grows.

- The root route intentionally opens the frontend-only project editor; the dashboard is retained as a separate feature module but is not the current entry experience.
