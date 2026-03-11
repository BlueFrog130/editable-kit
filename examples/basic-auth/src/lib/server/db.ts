import type { Data, ProjectData } from '$lib/types';

let data: Data = {
	// Hero
	name: {
		type: 'doc',
		content: [{ type: 'text', text: 'John Doe' }]
	},
	tagline: {
		type: 'doc',
		content: [{ type: 'text', text: 'Content Creator & Digital Storyteller' }]
	},
	avatar: {
		src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
		alt: 'John Doe portrait'
	},
	bio: {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: "I'm a content creator based in Los Angeles, passionate about visual storytelling, brand narratives, and building authentic connections through digital media."
					}
				]
			},
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'With over 8 years of experience across YouTube, podcasting, and written content, I help brands and individuals find their unique voice and share it with the world.'
					}
				]
			}
		]
	},

	// About
	about: {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'I started my journey as a freelance writer in 2016, and quickly discovered a love for '
					},
					{
						type: 'text',
						text: 'multimedia storytelling',
						marks: [{ type: 'bold' }]
					},
					{
						type: 'text',
						text: ". Over the years, I've expanded into video production, podcast hosting, and social media strategy."
					}
				]
			},
			{
				type: 'heading',
				attrs: { level: 3 },
				content: [{ type: 'text', text: 'What I Do' }]
			},
			{
				type: 'bulletList',
				content: [
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'Video Production',
										marks: [{ type: 'bold' }]
									},
									{
										type: 'text',
										text: ' — From concept to final cut, I create engaging video content for YouTube, social media, and brand campaigns.'
									}
								]
							}
						]
					},
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'Podcasting',
										marks: [{ type: 'bold' }]
									},
									{
										type: 'text',
										text: ' — Host of "Creative Pulse," a weekly podcast exploring the intersection of creativity and technology.'
									}
								]
							}
						]
					},
					{
						type: 'listItem',
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'Brand Strategy',
										marks: [{ type: 'bold' }]
									},
									{
										type: 'text',
										text: ' — I help brands develop authentic content strategies that resonate with their audience.'
									}
								]
							}
						]
					}
				]
			}
		]
	},

	// Featured Work
	projects: [
		{
			title: {
				type: 'doc',
				content: [{ type: 'text', text: 'Behind the Lens' }]
			},
			desc: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'A 12-part YouTube documentary series exploring the craft of independent filmmakers. Each episode dives deep into the creative process, from '
							},
							{
								type: 'text',
								text: 'pre-production planning',
								marks: [{ type: 'italic' }]
							},
							{
								type: 'text',
								text: ' to final color grading.'
							}
						]
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'The series reached over '
							},
							{
								type: 'text',
								text: '2 million views',
								marks: [{ type: 'bold' }]
							},
							{
								type: 'text',
								text: ' and was featured by YouTube as a recommended creator series.'
							}
						]
					}
				]
			},
			image: {
				src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=450&fit=crop',
				alt: 'Behind the Lens documentary series'
			}
		},
		{
			title: {
				type: 'doc',
				content: [{ type: 'text', text: 'Creative Pulse Podcast' }]
			},
			desc: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'A weekly podcast sitting down with artists, designers, and technologists to unpack their creative workflows. Featured guests include industry leaders from '
							},
							{
								type: 'text',
								text: 'Adobe, Figma, and Patagonia',
								marks: [{ type: 'bold' }]
							},
							{ type: 'text', text: '.' }
						]
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Now in its third season with over 150 episodes and a growing community of 50,000+ listeners.'
							}
						]
					}
				]
			},
			image: {
				src: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop',
				alt: 'Creative Pulse podcast recording setup'
			}
		},
		{
			title: {
				type: 'doc',
				content: [{ type: 'text', text: 'Brand Stories Collection' }]
			},
			desc: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'A curated portfolio of brand narrative campaigns created for startups and established companies alike. Each project focuses on '
							},
							{
								type: 'text',
								text: 'authentic storytelling',
								marks: [{ type: 'italic' }]
							},
							{
								type: 'text',
								text: ' that connects with real audiences.'
							}
						]
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Clients include Notion, Raycast, and Linear — helping them tell the human stories behind their products.'
							}
						]
					}
				]
			},
			image: {
				src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop',
				alt: 'Brand strategy workshop session'
			}
		}
	],

	// Footer
	footer: {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{ type: 'text', text: "Let's work together — reach out at " },
					{
						type: 'text',
						text: 'hello@johndoe.com',
						marks: [
							{
								type: 'link',
								attrs: {
									href: 'mailto:hello@johndoe.com',
									target: '_self',
									rel: null,
									class: null
								}
							}
						]
					},
					{
						type: 'text',
						text: ' or find me on '
					},
					{
						type: 'text',
						text: 'YouTube',
						marks: [
							{
								type: 'link',
								attrs: {
									href: 'https://youtube.com',
									target: '_blank',
									rel: 'noopener noreferrer',
									class: null
								}
							}
						]
					},
					{ type: 'text', text: ', ' },
					{
						type: 'text',
						text: 'Instagram',
						marks: [
							{
								type: 'link',
								attrs: {
									href: 'https://instagram.com',
									target: '_blank',
									rel: 'noopener noreferrer',
									class: null
								}
							}
						]
					},
					{ type: 'text', text: ', and ' },
					{
						type: 'text',
						text: 'LinkedIn',
						marks: [
							{
								type: 'link',
								attrs: {
									href: 'https://linkedin.com',
									target: '_blank',
									rel: 'noopener noreferrer',
									class: null
								}
							}
						]
					},
					{ type: 'text', text: '.' }
				]
			}
		]
	}
};

export async function load() {
	return data;
}

export async function save(newData: Data) {
	data = newData;
}
