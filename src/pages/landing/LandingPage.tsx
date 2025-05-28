import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LightBulbIcon, UserGroupIcon, LinkIcon, LockClosedIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { styleGuide } from '../../styles/styleGuide'
import CtaWithEmailCapture from '../../components/CtaWithEmailCapture'

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

const comparisons = [
	{
		feature: 'No login required',
		splitfair: true,
		splitwise: false,
		others: false,
	},
	{
		feature: 'Per-item assignment',
		splitfair: true,
		splitwise: true,
		others: false,
	},
	{
		feature: 'Share via link',
		splitfair: true,
		splitwise: true,
		others: false,
	},
	{
		feature: 'Group features',
		splitfair: 'coming-soon',
		splitwise: true,
		others: true,
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
		a: 'Group features, history, OCR, and more!',
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

					<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto`}>
						{benefits.map((b, i) => (
							<div
								key={i}
								className={`${styleGuide.components.card.base} ${styleGuide.components.card.hover}`}
							>
								<div className="flex items-start gap-4">
									<div className="bg-secondary-100 p-3 rounded-full shrink-0">
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
			
			{/* Comparison Section */}
			<section className={`${styleGuide.spacing.section.base} w-full bg-white`}>
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
								Why choose SplitFair?
							</h2>
							<p className={styleGuide.typography.subtitle.section}>
								See how we compare to other bill-splitting solutions
							</p>
						</div>
					</motion.div>

					<motion.div 
						className="max-w-3xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
					>
						<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							<table className="w-full table-fixed">
								<thead>
									<tr className="border-b border-gray-200 bg-gray-50">
										<th className="w-[40%] py-4 px-6 text-left text-sm font-semibold text-gray-900">Feature</th>
										<th className="w-[20%] py-4 px-4 text-center text-sm font-semibold text-primary-600">SplitFair</th>
										<th className="w-[20%] py-4 px-4 text-center text-sm font-semibold text-gray-900">Splitwise</th>
										<th className="w-[20%] py-4 px-4 text-center text-sm font-semibold text-gray-900">Others</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{comparisons.map((item, i) => (
										<tr key={i} className="hover:bg-gray-50 transition-colors">
											<td className="py-4 px-6 align-middle">
												<span className="text-sm font-medium text-gray-900">{item.feature}</span>
											</td>
											<td className="py-4 px-4 text-center align-middle">
												{item.splitfair === true && (
													<CheckIcon className="h-5 w-5 text-primary-600 mx-auto" />
												)}
												{item.splitfair === false && (
													<XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
												)}
												{item.splitfair === 'coming-soon' && (
													<span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20">
														Coming Soon
													</span>
												)}
											</td>
											<td className="py-4 px-4 text-center align-middle">
												{item.splitwise ? (
													<CheckIcon className="h-5 w-5 text-gray-600 mx-auto" />
												) : (
													<XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
												)}
											</td>
											<td className="py-4 px-4 text-center align-middle">
												{item.others ? (
													<CheckIcon className="h-5 w-5 text-gray-600 mx-auto" />
												) : (
													<XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="relative w-full py-32">
				{/* Gradient background layers */}
				<div className="absolute inset-0 bg-[linear-gradient(180deg,#E7F9D3_0%,#F8FAFC_100%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.8)_5%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,rgba(255,255,255,0.8)_95%,rgba(255,255,255,1)_100%)]" />
				
				<div className={`relative ${styleGuide.spacing.container}`}>
					<motion.div 
						className="max-w-2xl mx-auto text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className={styleGuide.typography.h2}>
							Loved by users worldwide
						</h2>
						<p className={styleGuide.typography.subtitle.section}>
							Join thousands who split bills effortlessly with SplitFair
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-4 md:px-0">
						{[
							{
								quote: "Finally a bill splitter that's actually simple!",
								author: "Ich",
								location: "Bangkok",
							},
							{
								quote: "Perfect for trips and shared groceries. No more calculator needed!",
								author: "Nina",
								location: "Singapore",
							},
							{
								quote: "Love how I can share the split with just a link. Makes splitting expenses so much easier!",
								author: "Ella",
								location: "Sydney",
							}
						].map((testimonial, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.2, duration: 0.6 }}
								className={`${styleGuide.components.card.base} bg-white/95 backdrop-blur transition-shadow duration-200 hover:shadow-lg h-full`}
							>
								<div className="flex flex-col h-full p-5">
									<p className="text-lg font-medium text-[#003B5C] mb-6 text-left leading-relaxed flex-1">
										"{testimonial.quote}"
									</p>
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
											<span className="text-sm font-medium text-primary-700">
												{testimonial.author[0]}
											</span>
										</div>
										<div className="min-w-0">
											<p className="font-semibold text-gray-900">{testimonial.author}</p>
											<p className="text-sm text-gray-600">{testimonial.location}</p>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className={`${styleGuide.spacing.section.base} w-full bg-white`}>
				<div className={styleGuide.spacing.container}>
					<motion.div 
						className="max-w-2xl mx-auto text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className={styleGuide.typography.h2}>
							Frequently asked questions
						</h2>
					</motion.div>

					<div className="max-w-3xl mx-auto">
						<div className="flex flex-col divide-y divide-gray-100">
							{faqs.map((faq, i) => {
								const open = openFaqs.includes(i)
								return (
									<div key={i} className="py-6 first:pt-0 last:pb-0">
										<button
											className="w-full flex items-center justify-between gap-6 text-left focus:outline-none group"
											onClick={() => toggleFaq(i)}
											aria-expanded={open}
										>
											<span className="text-lg text-gray-900 font-medium group-hover:text-gray-600 transition-colors">
												{faq.q}
											</span>
											<div className="flex-none">
												{open ? (
													<div className="h-6 w-6 text-gray-400 flex items-center justify-center">
														<span className="text-2xl font-light">−</span>
													</div>
												) : (
													<div className="h-6 w-6 text-gray-400 flex items-center justify-center">
														<span className="text-2xl font-light">+</span>
													</div>
												)}
											</div>
										</button>
										{open && (
											<div className="mt-4 text-base leading-7 text-gray-600">
												{faq.a}
											</div>
										)}
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</section>

			{/* Secondary CTA Section - full width */}
			<section className="w-full bg-primary-800 py-32">
				<div className="max-w-screen-xl mx-auto px-4">
					<CtaWithEmailCapture />
				</div>
			</section>
		</div>
	)
}

export default LandingPage