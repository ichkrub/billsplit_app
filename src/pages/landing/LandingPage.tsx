import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LightBulbIcon, UserGroupIcon, LinkIcon, ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { styleGuide } from '../../styles/styleGuide'

const benefits = [
	{
		icon: <LightBulbIcon className="h-8 w-8 text-secondary-700 mx-auto" />, // 💡
		title: 'Simple',
		desc: 'No login, no hassle. Just enter names and items.',
	},
	{
		icon: <UserGroupIcon className="h-8 w-8 text-secondary-700 mx-auto" />, // 🎯
		title: 'Fair',
		desc: 'Assign people per item, add tax, discount and more.',
	},
	{
		icon: <LinkIcon className="h-8 w-8 text-secondary-700 mx-auto" />, // 🔗
		title: 'Shareable',
		desc: 'Generate a link in one click — no app required.',
	},
]

const faqs = [
	{
		q: 'How does SplitFair work?',
		a: 'Enter names, add items, assign who pays for what, and SplitFair does the math.',
	},
	{
		q: 'Do I need to create an account?',
		a: 'No login required! Just use and share.',
	},
	{
		q: 'Is my data private?',
		a: 'Yes, splits are anonymous and links expire after 5 days.',
	},
	{
		q: 'Can I edit a split after sharing?',
		a: 'Yes, anyone with the link (and password, if set) can update assignments.',
	},
	{
		q: "What's coming next?",
		a: 'Group features, history, and more!',
	},
]

const LandingPage = () => {
	const [openFaqs, setOpenFaqs] = useState<number[]>([])

	const toggleFaq = (idx: number) => {
		setOpenFaqs((prev) =>
			prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
		)
	}

	return (
		<div className="relative w-full overflow-hidden">
			{/* Hero Section */}
			<section className={`relative ${styleGuide.spacing.section.hero}`}>
				{/* Gradient background layers */}
				<div className="absolute inset-0 z-0 bg-[linear-gradient(225deg,#E7F9D3_0%,#F8FAFC_100%)]" />
				<div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_right,#0077CC33_0%,transparent_70%)]" />
				<div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_95%)]" />
				<div className={`relative z-30 flex flex-col justify-center items-center ${styleGuide.spacing.container}`}>
					<motion.div 
						className="flex flex-col items-center gap-16 w-full"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<div className="max-w-[720px] mx-auto text-center">
							<h1 className={styleGuide.typography.h1.hero + " mb-6"}>
								Split bills instantly — no login, no math, no stress.
							</h1>
							<p className={`${styleGuide.typography.subtitle.hero} mb-10 mx-auto`}>
								Add people, assign items, and SplitFair handles the rest. Share a smart bill link in seconds — all for free.
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-6">
								<Link
									to="/quicksplit"
									className={`${styleGuide.components.button.base} ${styleGuide.components.button.primary} ${styleGuide.components.button.sizes.lg}`}
								>
									Try It Now
								</Link>
								<span className={`${styleGuide.components.button.base} ${styleGuide.components.button.secondary} ${styleGuide.components.button.sizes.lg} cursor-not-allowed select-none gap-3`}>
									<LockClosedIcon className="h-6 w-6 text-primary-400" />
									Coming soon: Group features
								</span>
							</div>
						</div>

						{/* Trusted For Section - Integrated within hero */}
						<div className="w-full max-w-4xl mx-auto">
							<motion.div
								className="flex flex-wrap justify-center items-center gap-3 md:gap-4"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3, duration: 0.6 }}
							>
								<span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary-100 hover:bg-white transition-colors">
									🍜 Meals with friends
								</span>
								<span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary-100 hover:bg-white transition-colors">
									✈️ Group trips
								</span>
								<span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary-100 hover:bg-white transition-colors">
									🏡 Shared bills
								</span>
								<span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary-100 hover:bg-white transition-colors">
									👫 Couples spending
								</span>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</section>
			
			{/* Benefits Section */}
			<section className={`${styleGuide.spacing.section.base} w-full bg-gray-50`}>
				<div className={styleGuide.spacing.container}>
					<motion.div 
						className="max-w-2xl mx-auto text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className="max-w-2xl mx-auto text-center mb-12">
							<h2 className={styleGuide.typography.h2}>
								Tons of features to make splitting bills effortless
							</h2>
							<p className={styleGuide.typography.subtitle.section}>
								Split any bill quickly and fairly with these powerful features
							</p>
						</div>
					</motion.div>

					<div className={`grid grid-cols-1 md:grid-cols-3 ${styleGuide.spacing.gap.xl} max-w-5xl mx-auto`}>
						{benefits.map((b, i) => (
							<div
								key={i}
								className={`${styleGuide.components.card.base} ${styleGuide.components.card.hover}`}
							>
								<div className="flex flex-col gap-4">
									<div className="bg-secondary-100 p-3 rounded-full w-fit">
										{b.icon}
									</div>
									<div>
										<h3 className="text-[1.25rem] font-semibold text-gray-800 mb-2">{b.title}</h3>
										<p className={styleGuide.typography.body.base}>{b.desc}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			{/* FAQ Section */}
			<section className={`${styleGuide.spacing.section.base} w-full bg-white`}>
				<div className={styleGuide.spacing.container}>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-10 max-w-5xl mx-auto">
						<div className="md:col-span-1 mb-12 md:mb-0">
							<h2 className={styleGuide.typography.h2}>Frequently asked questions</h2>
							<div className="mt-4 space-y-4">
								<p className="text-base text-gray-600">Stay updated with our latest features and updates.</p>
								<form className="space-y-3">
									<input
										type="email"
										placeholder="Enter your email"
										className={`${styleGuide.components.input.base} ${styleGuide.components.input.sizes.md}`}
									/>
									<button
										type="submit"
										className={`w-full ${styleGuide.components.button.base} ${styleGuide.components.button.primary} ${styleGuide.components.button.sizes.md}`}
									>
										Get Updates
									</button>
								</form>
							</div>
						</div>
						<div className="md:col-span-2">
							<div className="flex flex-col divide-y divide-gray-100">
							{faqs.map((faq, i) => {
								const open = openFaqs.includes(i)
								return (
									<div key={i} className="py-6">
										<button
											className="w-full flex items-center justify-between gap-6 text-left focus:outline-none group"
											onClick={() => toggleFaq(i)}
											aria-expanded={open}
										>
											<span className="text-lg text-gray-900 font-medium group-hover:text-gray-600 transition-colors">
												{faq.q}
											</span>
											<ChevronDownIcon
												className={`h-5 w-5 flex-none text-gray-400 transition-transform duration-200 ${
													open ? 'rotate-180' : ''
												}`}
											/>
										</button>
										{open && (
											<div className="mt-3 text-base leading-7 text-gray-600">
												{faq.a}
											</div>
										)}
									</div>
								)
							})}
						</div>
						</div>
					</div>
				</div>
			</section>
			{/* Secondary CTA Section - full width */}
			<section className="w-full bg-primary-800 py-32">
				<div className="max-w-screen-xl mx-auto text-center px-4">
					<h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
						Ready to split your next bill?
					</h3>
					<p className="text-white/80 mb-10 text-xl max-w-2xl mx-auto">
						Try SplitFair now and make group payments effortless.
					</p>
					<Link
						to="/quicksplit"
						className={`${styleGuide.components.button.base} ${styleGuide.components.button.alternate} ${styleGuide.components.button.sizes.lg} min-w-[240px]`}
					>
						Try SplitFair Now
					</Link>
				</div>
			</section>
		</div>
	)
}

export default LandingPage