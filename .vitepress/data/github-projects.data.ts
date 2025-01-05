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
        title: 'Vscode Theme',
        projects: ['abeixiaolu/xiaoluabei-vscode-theme'],
      },
      {
        title: 'Learning',
        projects: ['abeixiaolu/rustfinity', 'abeixiaolu/nuxt-tutorial'],
      },
    ]
    const env = loadEnv('', join(process.cwd(), 'src'))
    const octokit = new Octokit({ auth: env.VITE_GITHUB_TOKEN })

    const loadedProjects = await Promise.all(
      projects.map(async (project) => {
        const projects = await Promise.all(
          project.projects.map(async (project) => {
            const [owner, repo] = project.split('/')

            const { data } = await octokit.rest.repos.get({
              owner,
              repo,
            })

            return {
              name: project,
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
