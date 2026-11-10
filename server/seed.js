require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })
const slugify = require('slugify')
const mongoose = require('mongoose')
const connectDatabase = require('./config/database')
const { Article } = require('./models/Article')
const { AUTHOR_NAME } = require('./config/identity')

const examples = [
  { title: 'Teknoolajiyada cusub iyo fursadaha ay u furayso ganacsiyada Geeska Afrika', excerpt: 'Hal-abuurka dijitaalka ah wuxuu beddelayaa habka ay shirkadaha yaryar u koraan, u helaan macaamiil, una gaaraan suuqyo cusub.', category: 'Teknolojiyad', content: 'Ganacsiyada yaryar ee Geeska Afrika waxay wajahaan isbeddel degdeg ah oo dhanka dijitaalka ah. Adeegyada lacag-bixinta moobilka, ganacsiga internetka iyo agabka maaraynta xogtu waxay abuureen fursado aan hore u jirin.\n\nSi kastaba ha ahaatee, ka-faa’iidaysiga fursadahani wuxuu u baahan yahay maalgashi lagu sameeyo xirfadaha, isku-xidhka internetka iyo amniga xogta. Shirkadaha isku dara hal-abuurka iyo fahamka baahida bulshada ayaa leh fursadda ugu weyn ee ay ku kobci karaan.' },
  { title: 'Wadahadalka bulshada iyo doorka hay’adaha maxalliga ah', excerpt: 'Kalsoonida dadweynaha waxay ka bilaabataa wada-xaajood furan, adeegyo la heli karo iyo isla-xisaabtan muuqda.', category: 'Siyaasad', content: 'Hay’adaha maxalliga ahi waxay door muhiim ah ka ciyaaraan isu-dhoweynta bulshada iyo go’aan-qaadayaasha. Marka kulamada dadweynuhu noqdaan kuwo joogto ah oo xogtoodu si cad u furan tahay, waxaa kor u kaca fahamka iyo ka-qaybgalka muwaadiniinta.\n\nTallaabada xigta waa in fikradaha bulshada lagu xiro qorshayaal la cabbiri karo. Warbixin joogto ah oo muujisa wixii la qabtay iyo waxa dib u dhacay ayaa dhisaysa kalsooni waarta.' },
  { title: 'Ka-hortagga khataraha iyo adkaynta nabadgelyada bulshada', excerpt: 'Xog-wadaagista waqtigeeda ku timaadda iyo iskaashiga bulshada ayaa xoojiya awoodda ka-hortagga khataraha.', category: 'Amni', content: 'Nabadgelyada waarta waxay ku tiirsan tahay iskaashi joogto ah oo ka dhexeeya bulshada iyo adeegyada amniga. Hababka digniinta hore iyo xog-wadaagista masuulka ahi waxay caawiyaan in xaaladaha khatarta leh si deggan looga jawaabo.\n\nIsla markaas, ilaalinta xuquuqda muwaadiniinta iyo xogtooda gaarka ah waa qayb aan laga maarmi karin oo ka mid ah qorshe kasta oo amni.' },
  { title: 'Caafimaadka aasaasiga ah oo gaadha bulshooyinka fog', excerpt: 'Xalalka caafimaadka moobilka iyo shaqaalaha caafimaadka bulshada waxay yarayn karaan farqiga adeegga.', category: 'Caafimaad', content: 'Adeegyada caafimaadka ee meelaha fogfog waxay u baahan yihiin qorshe la jaanqaadaya nolosha dadka deegaanka. Shaqaalaha caafimaadka bulshada, adeegyada la-talinta fog iyo gaadiidka xaaladaha degdegga ahi waxay ka caawin karaan qoysaska helitaanka daryeel hore.\n\nMaalgelinta xarumaha aasaasiga ah iyo kaydka daawooyinka muhiimka ahi waxay door weyn ka ciyaaraan joogtaynta adeegga.' },
  { title: 'Ganacsiga xuduudaha iyo koboca dhaqaalaha gobolka', excerpt: 'Isku-xidhka suuqyada iyo fududaynta ganacsigu waxay abuuri karaan shaqooyin iyo dakhli cusub.', category: 'Dhaqaale', content: 'Ganacsiga gobolka wuxuu kobciyaa isku-xidhka wax-soo-saareyaasha, gaadiidka iyo suuqyada. Marka nidaamyada xuduudaha la fududeeyo, ganacsatada yaryar waxay si sahlan u gaadhi karaan macaamiil cusub.\n\nSi kobocu u noqdo mid loo dhan yahay, waxaa muhiim ah in la taageero xirfadaha shaqaalaha, helitaanka maalgelinta iyo kaabayaasha isku xidha magaalooyinka iyo meelaha miyiga ah.' },
]

const securityExamples = [
  {
    title: 'Ilaalinta Xogta iyo Isticmaalka Habboon ee Shabakadaha Ciidanka',
    excerpt: 'Falanqayn ku saabsan sugidda xogta iyo hababka casriga ah ee lagaga hortago khataraha dhijitaalka ah.',
    category: 'Amni',
    content: 'Falanqeyn ku saabsan muhiimadda ay leedahay sugidda amniga xogta iyo farsamada casriga ah ee la isticmaalo si looga hortago khataraha dhijitaalka ah.',
  },
  {
    title: 'Amniga Gobolka iyo Istaraatiijiyadda Hawlgallada Casriga ah',
    excerpt: 'Warbixin ku saabsan doorka wadashaqeynta bulshada iyo ciidanka ee xasiloonida iyo amniga guud.',
    category: 'Amni',
    content: 'Warbixin ku saabsan sida wadashaqeynta bulshada iyo ciidanka ay kor ugu qaaddo xasiloonida iyo sugidda amniga guud.',
  },
]

const coverImages = {
  Teknolojiyad: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85',
  Siyaasad: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=85',
  Amni: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1400&q=85',
  Caafimaad: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=85',
  Dhaqaale: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
}

async function seed() {
  try {
    await connectDatabase()
    const seedArticles = [...examples, ...securityExamples]
    const operations = seedArticles.map((article) => {
      const slug = slugify(article.title, { lower: true, strict: true })
      return {
        updateOne: {
          filter: { slug },
          update: {
            $set: {
              title: article.title,
              content: article.content,
              excerpt: article.excerpt,
              category: article.category,
              author: AUTHOR_NAME,
              coverImage: coverImages[article.category],
              readTime: Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200)),
            },
            $setOnInsert: { slug, createdAt: new Date() },
          },
          upsert: true,
        },
      }
    })
    const result = await Article.bulkWrite(operations, { ordered: false })
    console.log(`Seeded ${result.upsertedCount} new sample articles and updated ${result.modifiedCount} existing ones.`)
  } catch (error) {
    console.error('Unable to seed MongoDB:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seed()