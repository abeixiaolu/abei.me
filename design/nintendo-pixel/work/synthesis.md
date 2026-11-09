# Selected design

Candidate A is the base. It keeps VitePress navigation immediate and places animation ownership in a persistent companion. Candidate B independently recommends this shape after inspecting VitePress's early capture handler.

| Criterion | A | B |
| --- | --- | --- |
| Native navigation and history | Preserved without extra coordinator | Requires hook cancellation |
| Visual interaction | Arrival portal and independent jump/attack | Complete departure animation |
| Reduced motion | Static pose, immediate links | Must cancel pending departure |
| Maintenance | One companion and one registry | Router hooks and pending resolvers |

Graft B's explicit latest-action cancellation discipline into A's animation timer. Do not graft delayed routing. No different model family was available for the cross-judge, so the parent read both designs and selected the base.

Data shape is CompanionState with idle, jump, attack and portal variants. VitePress is the only navigation owner. Header and cartridges derive from one navigation registry.

Model the Domain determines the state union. Separate Before Serializing Shared State assigns source to one implementation owner and raster assets to the parent. Prove It Works requires browser operation of the running site after the build.
