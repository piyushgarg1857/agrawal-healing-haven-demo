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

## Clinic architecture
- Preserve shared navigation and existing semantic tokens so production content retains the approved visual design.
- Keep source-confirmed service definitions in a browser-safe module; never seed patient records or fabricate scheduling columns.
- Leaf routes own metadata and the favicon derives from the existing clinic logo.
- Until the original backend is linked through the editor, booking/admin fail closed with unavailable states; never replace missing integration with mock success or a new database.
