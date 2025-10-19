













class UserCard extends HTMLElement {
	constructor(data) {
		super()
		this.classList = "card"


		const elemConf = [
			{dataProp: "img", tag: "img", attr: "src"},
			// {dataProp: "img", tag: "img", className: "img-blur", attr: "src"},
			{dataProp: "user", tag: "span", attr: "textContent"},
			{dataProp: "game", tag: "span", attr: "textContent"},	
			{dataProp: "views", tag: "span", attr: "textContent"},	
			{dataProp: "title", tag: "span", attr: "textContent"}	
		]

		const children = {}
		for (const obj of elemConf) {
			const elem = obj.className || obj.dataProp
			children[elem] = Object.assign(document.createElement(obj.tag), {className: `card-${elem}`})
		}

		this.update = (cardData=data) => {
			Object.assign(this, cardData)
			for (const obj of elemConf) {
				const elem = obj.className || obj.dataProp
				children[elem][obj.attr] = cardData[obj.dataProp]
			}
		}
		this.update()


		const textWrap = Object.assign(document.createElement("div"), {className: `card-text-wrap`})
		const titleRow = Object.assign(document.createElement("div"), {className: `card-top-text`})
		titleRow.append(children.user, children.views)
		textWrap.append(titleRow, children.game, children.title)
		this.append(children.img, textWrap)








		const compileSiteLink = () => `https://${this.site}.${this.site.includes("twitch") ? "tv" : "com"}/${this.user.toLowerCase()}`
		this.site.includes("twitch") && this.addEventListener("click", e => {
			if (e.target !== children.img && window.getSelection().isCollapsed) {
				const wrap = Object.assign(document.createElement("div"), {
					id: "stream-img-wrap",
					tabIndex: -1,
					onkeydown: e => e.key == "Escape" && wrap.remove(),
					onclick: e => wrap.remove()
				})

				const img = Object.assign(document.createElement("img"), {id: "stream-img", src: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${this.user.toLowerCase()}-854x480.jpg`})
				wrap.append(img)
				document.body.append(wrap)
				wrap.focus()
			}
		})

		children.img.addEventListener("click", e => {
			window.open(compileSiteLink(), "_blank")
		})

		this.draggable = true
		this.addEventListener("dragstart", e => {
			e.dataTransfer.setDragImage(document.createElement("img"), 0, 0)
			e.dataTransfer.setData("text/plain", compileSiteLink())
		})
	}


}


customElements.define("user-card", UserCard)


























class Main {
	constructor() {
	
		const siteBtns = {}
		const siteLayouts = {}
		const siteCounter = this.siteCounter = {}






		localStorage.autoref ??= JSON.stringify({val: false, min: 10})
		const verifyNum = val => Number(val) >= 1 ? val : 10
		const getRefProp = prop => JSON.parse(localStorage.autoref)[prop]



		const settingsBtn = document.getElementById("settings-btn")
		const settings = Object.assign(document.createElement("div"), {className: "menu", id: "settings"})
		settingsBtn.append(settings)

		const refRow = Object.assign(document.createElement("div"), {className: "menu-row-wrap"})
		const refToggle = Object.assign(document.createElement("input"), {
			type: "checkbox",
			className: "checkbox", 
			id: "refresh-toggle",
			checked: getRefProp("val"),
			onchange: () => {
				const obj = JSON.parse(localStorage.autoref)
				obj.val = refToggle.checked
				localStorage.autoref = JSON.stringify(obj)
				setRefLoop(refToggle.checked)
			}
		})

		const inputInterv = Object.assign(document.createElement("input"), {
			className: "input",
			id: "input-interval",
			value: getRefProp("min"),
			onchange: () => {
				const obj = JSON.parse(localStorage.autoref)
				obj.min = inputInterv.value = verifyNum(inputInterv.value)
				localStorage.autoref = JSON.stringify(obj)
				refToggle.checked && setRefLoop(true)
			}
		})

		settings.append(refRow)
		refRow.append(
			refToggle, 
			Object.assign(document.createElement("span"), {textContent: "Auto-refresh minute interval"}), 
			inputInterv,
		)








	


		const managerBtn = document.getElementById("manager-btn")
		for (const btn of [managerBtn, settingsBtn]) btn.addEventListener("click", e => e.target === btn && btn.classList.toggle("enabled"))

		this.managerLayout
		const manager = Object.assign(document.createElement("div"), {className: "menu", id: "manager"})
		const createManagerRow = (className=null) => Object.assign(document.createElement("div"), {className: `menu-row-wrap${className ? ` ${className}` : ""}`})
		const siteBtnRow = createManagerRow("site-btns")
		manager.append(siteBtnRow)
		managerBtn.append(manager)




		const createUserRow = user => {
			const wrap = Object.assign(document.createElement("div"), {className: "user-row"})
			const delBtn = Object.assign(document.createElement("button"), {
				className: "btn icon icon-delete",
				onclick: () => {
					wrap.remove()
					removeUser(user)
					completerWrap.hide()
				}
			})
			wrap.append(Object.assign(document.createElement("span"), {textContent: user}), delBtn)
			return wrap
		}	

		const addUser = user => {
			const users = JSON.parse(localStorage.users)
			if (user && !users[this.managerLayout].includes(user)) {
				users[this.managerLayout].push(user)
				localStorage.users = JSON.stringify(users)
				managerUserWrap.querySelector(".visible").append(createUserRow(user))
				siteLayouts[this.managerLayout].add(null, user)
				completerWrap.hide()
				return true
			}
		}
		const removeUser = user => {
			const users = JSON.parse(localStorage.users)
			users[this.managerLayout] = users[this.managerLayout].filter(i => i !== user)
			localStorage.users = JSON.stringify(users)
			siteLayouts[this.managerLayout].remove(user)
		}

		const managerInput = Object.assign(document.createElement("input"), {
			className: "input",
			placeholder: "Channel name",
			oninput: () => completer.update(),
			onkeydown: e => {
				if (e.key === " ") e.preventDefault()
				if (e.key === "Enter") addUser(managerInput.value) && (managerInput.value = "")
			}
		})

		const completerWrap = Object.assign(document.createElement("div"), {id: "completer-wrap", hide: () => completerWrap.classList.remove("visible")})
		const completer = Object.assign(document.createElement("div"), {
			id: "completer",
			update: () => {
				const text = managerInput.value
				const layout = managerUserWrap.querySelector(".visible")

				let children = Array.from(layout.children, i => Object.assign(document.createElement("span"), {
					textContent: i.firstChild.textContent,
					onclick: e => {
						const layout = managerUserWrap.querySelector(".visible")
						const userRow = Array.from(layout.getElementsByClassName("user-row")).find(i => i.firstChild.textContent === e.target.textContent)
						completerWrap.hide()
						layout.parentElement.scrollTop = userRow.offsetTop - layout.parentElement.clientHeight / 2
						userRow.classList.add("focused")
						setTimeout(() => userRow.classList.remove("focused"), 1000)
					}
				}))
				children = children.filter(i => text && i.textContent.toLowerCase().includes(text.toLowerCase()))
				completer.replaceChildren(...children)
				completerWrap.classList[children.length ? "add" : "remove"]("visible")

			}
		})
		const addUserBtn = Object.assign(document.createElement("button"), {
			className: "btn icon icon-add",
			onclick: () => addUser(managerInput.value) && (managerInput.value = "")
		})

		const inputRow = createManagerRow("input-row")
		completerWrap.append(completer)
		inputRow.append(managerInput, completerWrap, addUserBtn)
		manager.append(inputRow)

		const managerUserWrap = Object.assign(document.createElement("div"), {id: "manager-user-wrap"})
		manager.append(managerUserWrap)














		localStorage.users ??= JSON.stringify({twitch: [], kick: []})
		localStorage.layout ??= JSON.stringify({twitch: {}})



		for (const [index, [func, site]] of [
			[this.getKick, "kick"], 
			[this.getTwitch, "twitch"]].entries()
			) {
			const layout = Object.assign(document.createElement("div"), {
				className: "card-layout",
				update: async () => {
					const data = await func.call(this, JSON.parse(localStorage.users)[site])
					const layoutCards = Object.fromEntries(Array.from(layout.getElementsByClassName("card"), c => [c.user, c]))

					// remove offline cards
					const dataUsers = data.map(i => i.user)
					for (const [user, card] of Object.entries(layoutCards)) {
						!dataUsers.includes(user) && layout.remove(user)
					}
					// add or update cards
					for (const dataEntry of data) {
						dataEntry.user in layoutCards 
						? (layoutCards[dataEntry.user].update(dataEntry), layout.insert(dataEntry, layoutCards[dataEntry.user]))
						: layout.add(dataEntry)
					}
				
				},
				remove: user => {
					Array.from(layout.children).find(c => c.user === user)?.remove()
				},
				add: async (data, user=null) => {
					if (user) data = (await func.call(this, [user]))[0]
					data && layout.insert(data)
				},
				insert: (data, card=null) => {
					const insertAt = Array.from(layout.children).findIndex(child => child.views < data.views)
					layout.insertBefore(card || new UserCard(data), layout.children[insertAt])
				},
				setWidth: width => {
					layout.style.flex = `0 0 ${width}%`
					const layoutData = JSON.parse(localStorage.layout)
					layoutData[site].width = width
					localStorage.layout = JSON.stringify(layoutData)
				}

			})

			const layoutParent = document.getElementById("card-layout-wrap")
			layoutParent.prepend(layout)
			siteLayouts[site] = layout








			const btn = Object.assign(document.createElement("button"), {
				className: `btn layout-btn icon icon-${site}`,
				onclick: e => {
					btn.setState()
					const layoutData = JSON.parse(localStorage.layout)
					if (inLayouts() && Object.keys(layoutData).length !== 1) delete layoutData[site]
					else {
						layoutData[site] = layout.style.flexBasis ? {width: parseInt(layout.style.flexBasis)} : {}
					}
					localStorage.layout = JSON.stringify(layoutData)
				},
				
				setState: () => {
					btn.classList.toggle("enabled")
					layout.classList.toggle("visible")

					const totalVisible = Object.values(siteBtns).filter(i => i.classList.contains("enabled")).length
					!totalVisible && btn.setState()
				}
			})


			let counter = Object.assign(document.createElement("span"), {
				classList: `counter ${site}-counter`,
				set: val => {
					const newVal = typeof val === "function" ? val(Number(counter.textContent)) : val
					counter.textContent = newVal ? newVal : ""
				}
			})
			siteBtns[site] = btn
			siteCounter[site] = counter
			document.getElementById("control-bar").prepend(btn)
			btn.append(counter)

			const inLayouts = () => site in JSON.parse(localStorage.layout)
			inLayouts() && btn.setState()







			// dividers
			if (index) {
				const divider = Object.assign(document.createElement("div"), {
					className: "divider",
					onmousedown: e => {
						divider.assignListeners()
						divider.gripOffset = e.clientX - divider.offsetLeft
					},
					dragEvent: e => {
						let width = (e.clientX - divider.gripOffset) / layoutParent.offsetWidth * 100
						const maxWidth = (parseFloat(getComputedStyle(divider.nextSibling).minWidth) + divider.clientWidth) / layoutParent.offsetWidth * 100
						width = Math.min(Math.max(0, width), 100 - maxWidth)
						layout.setWidth(width)
					},

					removeListeners: () => divider.assignListeners(false),
					assignListeners: (set=true) => {
						for (const [e, func] of Object.entries({
							mousemove: divider.dragEvent, 
							mouseup: divider.removeListeners
						})) document[set ? "addEventListener" : "removeEventListener"](e, func)

						document.body.style = `user-select: ${set ? "none" : "auto"}; cursor: ${set ? "col-resize" : "auto"}`
					}

				})

				layout.after(divider)
				const layoutData = JSON.parse(localStorage.layout)
				if ("width" in (layoutData[site] || {})) layout.setWidth(layoutData[site].width)
		

			}







			const managerLayout = Object.assign(document.createElement("div"), {className: "manager-user-layout"})
			managerLayout.append(...JSON.parse(localStorage.users)[site].map(user => createUserRow(user)))
			managerUserWrap.append(managerLayout)

			
			const managerBtn = Object.assign(document.createElement("button"), {
				className: `btn icon icon-${site}`,
				onclick: () => {
					for (const btn of siteBtnRow.querySelectorAll("button")) btn.classList.remove("enabled")
					for (const l of managerUserWrap.getElementsByClassName("manager-user-layout")) l.classList.remove("visible")
					managerBtn.classList.add("enabled")
					managerLayout.classList.add("visible")
					this.managerLayout = site
					completer.update()
				}
			})
			managerBtn.click()
			siteBtnRow.prepend(managerBtn)



		}












		const refreshBtn = document.getElementById("refresh")
		refreshBtn.addEventListener("click", () => {
			for (const l of Object.values(siteLayouts)) l.classList.contains("visible") && l.update()
		})
		// init cards
		refreshBtn.click()


		document.addEventListener("keydown", e => {
			const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
			if (!isTyping && (e.ctrlKey || !e.ctrlKey) && e.key === "r") {
				e.preventDefault()
				refreshBtn.click()
			}
		})



		let refLoop
		const setRefLoop = (set=true) => {
			clearInterval(refLoop)
			if (set) {
				refLoop = setInterval(() => refreshBtn.click(), Number(inputInterv.value) * 60000)
			}
		}
		setRefLoop(getRefProp("val"))


	}















	async getTwitch(users) {
		const data = await Promise.all(users.map(async (user, n) => {
			try {
				let response = await fetch("https://gql.twitch.tv/gql", {
					method: "POST", 
					headers: {"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"},
					// body: `[{"operationName":"UseViewCount","variables":{"channelLogin":"${user}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"00b11c9c428f79ae228f30080a06ffd8226a1f068d6f52fbc057cbde66e994c2"}}}, {"operationName":"StreamMetadata","variables":{"channelLogin":"${user}","includeIsDJ":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"a647c2a13599e5991e175155f798ca7f1ecddde73f7f341f39009c14dbf59962"}}}]`
					body: `[{"operationName":"ChannelShell","variables":{"login":"${user}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe"}}}, {"operationName":"ComscoreStreamingQuery","variables":{"channel":"${user}","clipSlug":"","isClip":false,"isLive":true,"isVodOrCollection":false,"vodID":""},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"e1edae8122517d013405f237ffcc124515dc6ded82480a88daef69c83b53ac01"}}}]`
				})


				this.siteCounter.twitch.set(val => ++val)
				response = await response.json()
				return {
					// no game could be set
					game: response[1]["data"]["user"]["stream"].game?.name || "",
					views: response[0]["data"]["userOrError"]["stream"]["viewersCount"],
					title: response[1]["data"]["user"]["broadcastSettings"]["title"],
					img: response[0]["data"]["userOrError"]["profileImageURL"],
					user: response[0]["data"]["userOrError"]["displayName"],
					site: "twitch"
				}
			}

			catch {return null}

		}))

		this.siteCounter.twitch.set(0)
		return data.filter(Boolean)
	}










	async getKick(users) {
		const data = await Promise.all(users.map(async (user, n) => {
			try {
				let response = await fetch(`https://kick.com/api/v2/channels/${user}`)
				this.siteCounter.kick.set(val => ++val)
				response = JSON.parse(await response.text())

				return {
					game: response["livestream"]["categories"][0]["name"],
					views: response["livestream"]["viewer_count"],
					title: response["livestream"]["session_title"],
					img: response["user"]["profile_pic"] || "https://files.kick.com/images/user/6937907/profile_image/conversion/80a89cbd-7052-49cd-b710-16778899bd86-thumb.webp",
					user: response["user"]["username"],
					site: "kick"
				}
			}

			catch {return null}

		}))

		this.siteCounter.kick.set(0)
		return data.filter(Boolean)
	}









}












new Main()










