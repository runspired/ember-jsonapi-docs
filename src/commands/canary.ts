import { Command, flags } from '@oclif/command'
import * as SafePromise from 'bluebird'
import * as deepMerge from 'deepmerge'
import 'hard-rejection/register'
import * as prettyTime from 'pretty-time'
import { downloadEmberCanaryDoc } from '../lib/download-ember-canary-doc'
import { downloadEmberDataCanaryDoc } from '../lib/download-ember-data-canary-doc'
import { processProjectDoc } from '../lib/process-project-doc'
import readDocs from '../lib/read-docs'
import { uploadDocsToS3 } from '../lib/s3-sync'
import saveDoc from '../lib/save-document'

export default class Canary extends Command {
	static description = 'describe the command here'

	static flags = {
		help: flags.help({ char: 'h' }),
		publish: flags.boolean(),
	}

	async run() {
		const hrstart = process.hrtime()

		const { flags } = this.parse(Canary)

		const projectsToProcess = ['ember', 'ember-data']

		let supportedProjects = new Map()
		supportedProjects.set('ember', await downloadEmberCanaryDoc(this.config))
		supportedProjects.set('ember-data', await downloadEmberDataCanaryDoc(this.config))

		const getProjectFiles = (projectName: string) => [supportedProjects.get(projectName)]

		let docs: any = await readDocs(projectsToProcess, getProjectFiles)

		await SafePromise.mapSeries(projectsToProcess, projectName =>
			SafePromise.map(docs[projectName], doc => processProjectDoc(projectName, doc), {
				concurrency: 10,
			}).then(docs => saveDoc(deepMerge.all(docs), projectName))
		)

		if (flags.publish) {
			await uploadDocsToS3()
		}

		let processExecTimeSummary = prettyTime(process.hrtime(hrstart))
		console.info(`Done in ${processExecTimeSummary}`)
	}
}