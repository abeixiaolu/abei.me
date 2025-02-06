import type { Project } from '../theme/types/project'
import { join } from 'node:path'
import process from 'node:process'
import { Octokit } from 'octokit'
import { loadEnv } from 'vitepress'

declare const data: {
  title: string
  projects: Project[]
}[]
export { data }

export default {
  async load() {
    const projects = [
      {
        title: 'Personal',
        projects: ['abei.me'],
      },
      {
        title: 'Vscode Theme',
        projects: ['xiaoluabei-vscode-theme'],
      },
      {
        title: 'Learning',
        projects: ['rustfinity', 'nuxt-tutorial', 'php-study'],
      },
    ]
    const env = loadEnv('', join(process.cwd(), '.'))
    const octokit = new Octokit({ auth: env.VITE_GITHUB_TOKEN })

    const loadedProjects = await Promise.all(
      projects.map(async (project) => {
        const projects = await Promise.all(
          project.projects.map(async (repo) => {
            const { data } = await octokit.rest.repos.get({
              owner: 'abeixiaolu',
              repo,
            })

            return {
              name: repo,
              description: data.description,
              url: data.html_url,
            } satisfies Project
          }),
        )

        return { ...project, projects }
      }),
    )

    return loadedProjects
  },
}
