import { Title } from '@solidjs/meta';
import { For } from 'solid-js';
import Badge from '../../components/Badge';
import StnHeader from '../../components/StnHeader';
import { content, padIndex, type Project } from '../../lib/content';
import { pageTitle } from '../../lib/page-title';

const page = content.pages.projects;
const groups = page.groups ?? [];
const totalPads = groups.reduce((sum, g) => sum + g.projects.length, 0);
const headerMeta = page.meta ?? `MODE ${padIndex(totalPads)}`;

function isRepo(url: string) {
  try {
    return new URL(url).hostname.includes('github.com');
  } catch {
    return false;
  }
}

function resolveLinks(project: Project) {
  let repo = project.repo;
  let live = project.live;
  if (project.url) {
    if (isRepo(project.url)) repo ??= project.url;
    else live ??= project.url;
  }
  return { repo, live };
}

export default function ProjectsPage() {
  return (
    <section>
      <Title>{pageTitle(page.title)}</Title>
      <StnHeader
        caption={page.caption}
        meta={headerMeta}
        title={page.title}
        lede={page.lede}
      />

      <div class="mt-8 space-y-8">
        <For each={groups}>
          {(group) => (
            <div>
              <div class="mb-3 flex items-center justify-between gap-3">
                <Badge>{group.title}</Badge>
                <span class="font-mono text-[9px] uppercase tracking-[0.14em] text-dim">
                  Bank · {padIndex(group.projects.length)} pads
                </span>
              </div>

              <div class="hw-pad-bank">
                <ul class="hw-pad-grid">
                  <For each={group.projects}>
                    {(project, i) => {
                      const links = () => resolveLinks(project);
                      const primary = () => links().live ?? links().repo;
                      return (
                        <li>
                          <div class="hw-key hw-pad">
                            {primary() && (
                              <a
                                class="hw-pad-stretch"
                                href={primary()}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={project.name}
                              />
                            )}
                            <div class="hw-key-pad hw-pad-face">
                              <div class="hw-pad-meta">
                                <span class="hw-pad-index">{padIndex(i() + 1)}</span>
                                <span class="hw-pad-actions">
                                  {links().repo && (
                                    <a
                                      class="hw-pad-action"
                                      href={links().repo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-tone="repo"
                                    >
                                      <span
                                        class="hw-pad-led"
                                        data-tone="repo"
                                        aria-hidden="true"
                                      />
                                      Repo
                                    </a>
                                  )}
                                  {links().live && (
                                    <a
                                      class="hw-pad-action"
                                      href={links().live}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-tone="live"
                                    >
                                      <span
                                        class="hw-pad-led"
                                        data-tone="live"
                                        aria-hidden="true"
                                      />
                                      Live
                                    </a>
                                  )}
                                </span>
                              </div>

                              <span class="hw-pad-title">
                                <span
                                  class={[
                                    'shrink-0 text-base opacity-70',
                                    links().live
                                      ? 'i-carbon-direction-right-01-filled'
                                      : 'i-carbon-logo-github',
                                  ]}
                                  aria-hidden="true"
                                />
                                {project.name}
                              </span>

                              <span class="hw-pad-desc">{project.description}</span>
                            </div>
                          </div>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </div>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
