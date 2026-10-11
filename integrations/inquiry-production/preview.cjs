// Generates local sample HTML/plain-text emails; never sends email.
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const out = process.argv[2] || '/private/tmp/primoris-email-preview'
fs.mkdirSync(out, {recursive: true})
const context = {}
vm.createContext(context)
vm.runInContext(fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8') + '\nthis.interests = INTERESTS;', context)
for (const [name, grade, interests] of [
  ['lower-tour-shadow', '3', ['apply', 'tour', 'shadow-days']],
  ['upper-tour-shadow', '7', ['apply', 'tour', 'shadow-days']],
  ['newsletter-only', '10', ['newsletters']]
]) {
  const row = ['sample-reference', new Date(), 'Sample Student', 'Sample', 'Parent', '', 'sample@example.com', grade]
    .concat(context.interests.map(item => interests.includes(item[0])))
  const message = context.applicantReply_(row, {upperSchoolMinGrade: 5, p: {getProperty: () => null}})
  // Point images at the checked-out assets for an offline preview before deployment.
  const html = message.htmlBody.replaceAll('https://primorisacademy.org/img/', 'file://' + path.resolve(__dirname, '../../static/img') + '/')
  fs.writeFileSync(path.join(out, name + '.html'), html)
  fs.writeFileSync(path.join(out, name + '.txt'), message.body)
}
console.log('Sample emails written to ' + out + ' (confirmed upper-school boundary: grade 5).')
