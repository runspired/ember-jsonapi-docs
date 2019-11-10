import { Command, flags } from '@oclif/command'
import 'hard-rejection/register'
import * as prettyTime from 'pretty-time'
import RSVP from 'rsvp'
import { filler1 } from '../lib/filler1'
import { filler2 } from '../lib/filler2'

import { revProjectDocs } from '../lib/rev-project-docs'
import { uploadDocsToS3 } from '../lib/s3-sync'
import { supportedProjects } from '../lib/supported-projects'
import readDocs from '../lib/read-docs'

export default class FullRun extends Command {
	static description = 'describe the command here'

	static flags = {
		help: flags.help({ char: 'h' }),
		// // flag with a value (-n, --name=VALUE)
		// name: flags.string({ char: 'n', description: 'name to print' }),
		// // flag with no value (-f, --force)
		// force: flags.boolean({ char: 'f' }),
	}

	static args = [{ name: 'file' }]

	async run() {
		const hrstart = process.hrtime()
		let docs = await readDocs(supportedProjects)

		await RSVP.map(supportedProjects, projectName =>
			RSVP.map(docs[projectName], doc => filler2(projectName, doc)).then(docs =>
				filler1(projectName, docs)
			)
		)

		await revProjectDocs(supportedProjects)

		await uploadDocsToS3()

		console.info(prettyTime(process.hrtime(hrstart)))
	}
}