import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LightBulbIcon, UserGroupIcon, LinkIcon, QuestionMarkCircleIcon, ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/outline'

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
		<div className="flex-1 bg-slate-50">
			<div className="max-w-6xl mx-auto px-4 pt-16">
				<div className="min-h-[60vh] flex flex-col justify-center items-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="max-w-2xl w-full text-center mb-12"
					>
						<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
							Split bills with friends —{' '}
							<span className="text-primary-600">instantly</span> and{' '}
							<span className="text-primary-600">fairly</span>.
						</h1>
						<p className="text-lg md:text-xl text-gray-600 mb-8">
							No login, no stress. Just tap, assign, and share.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Link
								to="/quicksplit"
								className="btn-primary text-lg px-8 py-4 font-bold shadow-md hover:scale-105 transition-transform duration-150"
							>
								Try It Now
							</Link>
							<span className="inline-flex items-center px-6 py-4 rounded-md bg-slate-200 border border-slate-300 text-gray-500 font-semibold cursor-not-allowed select-none gap-2 opacity-90">
								<LockClosedIcon className="h-5 w-5 text-gray-400" />
								Coming soon: Group features
							</span>
						</div>
					</motion.div>
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
				</div>
			</div>
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