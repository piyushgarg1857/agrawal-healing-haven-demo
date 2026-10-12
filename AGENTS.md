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

## Design reference architecture
- Keep all clinic bookings and admin records in transient React state; this project is a non-connected design reference and must not send patient or payment data.
- Use shared clinic navigation and semantic tokens in the global stylesheet to keep all concept views visually consistent.
- Keep sample services and fictional admin records in a browser-safe data module so display screens share one illustrative source.
- Use leaf-route metadata for every content page and derive the favicon from the active clinic logo.
