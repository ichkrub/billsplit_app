import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LightBulbIcon, UserGroupIcon, LinkIcon, QuestionMarkCircleIcon, ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { styleGuide } from '../../styles/styleGuide'

const benefits = [
	{
		icon: <LightBulbIcon className="h-8 w-8 text-primary-500 mx-auto" />, // 💡
		title: 'Simple',
		desc: 'No login, no hassle. Just enter names and items.',
	},
	{
		icon: <UserGroupIcon className="h-8 w-8 text-primary-500 mx-auto" />, // 🎯
		title: 'Fair',
		desc: 'Assign people per item, add tax, discount and more.',
	},
	{
		icon: <LinkIcon className="h-8 w-8 text-primary-500 mx-auto" />, // 🔗
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
		<div className="flex-1">
			{/* Hero Section with gradient background */}
			<div className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
				<div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
					<div className="relative min-h-[70vh] flex flex-col justify-center items-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7 }}
							className="max-w-3xl w-full text-center"
						>
							<h1 className={styleGuide.typography.h1.hero + " mb-8"}>
								Split bills instantly — no login, no math, no stress.
							</h1>
							<p className={`${styleGuide.typography.subtitle.hero} mb-12 max-w-2xl mx-auto`}>
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
						</motion.div>
					</div>
				</div>
			</div>
			
			{/* Benefits Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, delay: 0.2 }}
				className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
			>
				{benefits.map((b, i) => (
					<div
						key={i}
						className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
					>
						{b.icon}
						<h3 className="mt-4 text-lg font-bold text-gray-900">
							{b.title}
						</h3>
						<p className="mt-2 text-gray-600 text-base">{b.desc}</p>
					</div>
				))}
			</motion.div>
			{/* FAQ Section */}
			<section className="w-full max-w-2xl mx-auto mb-16">
				<h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
					<QuestionMarkCircleIcon className="h-7 w-7 text-primary-500" />
					Frequently Asked Questions
				</h2>
				<div className="flex flex-col gap-4">
					{faqs.map((faq, i) => {
						const open = openFaqs.includes(i)
						return (
							<div key={i} className="bg-white rounded-xl shadow-md">
								<button
									className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
									onClick={() => toggleFaq(i)}
									aria-expanded={open}
								>
									<span className="font-semibold text-gray-900 text-base md:text-lg">
										{faq.q}
									</span>
									<ChevronDownIcon
										className={`h-6 w-6 text-primary-500 transition-transform duration-200 ${
											open ? 'rotate-180' : ''
										}`}
									/>
								</button>
								{open && (
									<div className="px-5 pb-4 text-gray-600 text-base border-t border-slate-100 animate-fade-in">
										{faq.a}
									</div>
								)}
							</div>
						)
					})}
				</div>
			</section>
			{/* Secondary CTA Section - full width */}
			<section className="w-full bg-primary-100 py-16 border-t border-primary-200">
				<div className="max-w-screen-xl mx-auto text-center px-4">
					<h3 className="text-2xl font-bold text-primary-700 mb-4">
						Ready to split your next bill?
					</h3>
					<p className="text-gray-700 mb-8 text-lg">
						Try SplitFair now and make group payments effortless.
					</p>
					<Link
						to="/quicksplit"
						className="btn-primary text-lg px-10 py-4 inline-block"
					>
						Try SplitFair Now
					</Link>
				</div>
			</section>
		</div>
	)
}

export default LandingPage