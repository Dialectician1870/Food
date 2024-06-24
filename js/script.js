
window.addEventListener("DOMContentLoaded", function () {
	// Tabs

	let tabs = document.querySelectorAll(".tabheader__item"),
		tabsContent = document.querySelectorAll(".tabcontent"),
		tabsParent = document.querySelector(".tabheader__items");

	function hideTabContent() {
		tabsContent.forEach((item) => {
			item.classList.add("hide");
			item.classList.remove("show", "fade");
		});

		tabs.forEach((item) => {
			item.classList.remove("tabheader__item_active");
		});
	}

	function showTabContent(i = 0) {
		tabsContent[i].classList.add("show", "fade");
		tabsContent[i].classList.remove("hide");
		tabs[i].classList.add("tabheader__item_active");
	}

	hideTabContent();
	showTabContent();

	tabsParent.addEventListener("click", function (event) {
		const target = event.target;
		if (target && target.classList.contains("tabheader__item")) {
			tabs.forEach((item, i) => {
				if (target == item) {
					hideTabContent();
					showTabContent(i);
				}
			});
		}
	});

	// Timer

	const deadline = "2024-12-31";

	function getTimeRemaining(endtime) {
		const t = Date.parse(endtime) - Date.parse(new Date()),
			days = Math.floor(t / (1000 * 60 * 60 * 24)),
			seconds = Math.floor((t / 1000) % 60),
			minutes = Math.floor((t / 1000 / 60) % 60),
			hours = Math.floor((t / (1000 * 60 * 60)) % 24);

		return {
			total: t,
			days: days,
			hours: hours,
			minutes: minutes,
			seconds: seconds,
		};
	}

	function getZero(num) {
		if (num >= 0 && num < 10) {
			return "0" + num;
		} else {
			return num;
		}
	}

	function setClock(selector, endtime) {
		const timer = document.querySelector(selector),
			days = timer.querySelector("#days"),
			hours = timer.querySelector("#hours"),
			minutes = timer.querySelector("#minutes"),
			seconds = timer.querySelector("#seconds"),
			timeInterval = setInterval(updateClock, 1000);

		updateClock();

		function updateClock() {
			const t = getTimeRemaining(endtime);

			days.innerHTML = getZero(t.days);
			hours.innerHTML = getZero(t.hours);
			minutes.innerHTML = getZero(t.minutes);
			seconds.innerHTML = getZero(t.seconds);

			if (t.total <= 0) {
				clearInterval(timeInterval);
			}
		}
	}

	setClock(".timer", deadline);

	// Modal

	const modalTrigger = document.querySelectorAll("[data-modal]"),
		modal = document.querySelector(".modal");

	modalTrigger.forEach((btn) => {
		btn.addEventListener("click", openModal);
	});

	function closeModal() {
		modal.classList.add("hide");
		modal.classList.remove("show");
		document.body.style.overflow = "";
	}

	function openModal() {
		modal.classList.add("show");
		modal.classList.remove("hide");
		document.body.style.overflow = "hidden";
		clearInterval(modalTimerId);
	}

	modal.addEventListener("click", (e) => {
		if (e.target === modal || e.target.getAttribute("data-close") == "") {
			closeModal();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.code === "Escape" && modal.classList.contains("show")) {
			closeModal();
		}
	});

	const modalTimerId = setTimeout(openModal, 300000);
	// Изменил значение, чтобы не отвлекало

	function showModalByScroll() {
		if (
			window.pageYOffset + document.documentElement.clientHeight >=
			document.documentElement.scrollHeight
		) {
			openModal();
			window.removeEventListener("scroll", showModalByScroll);
		}
	}
	window.addEventListener("scroll", showModalByScroll);

	// Используем классы для создание карточек меню

	class MenuCard {
		constructor(src, alt, title, descr, price, parentSelector, ...classes) {
			this.src = src;
			this.alt = alt;
			this.title = title;
			this.descr = descr;
			this.price = price;
			this.classes = classes;
			this.parent = document.querySelector(parentSelector);
			this.transfer = 27;
			this.changeToUAH();
		}

		changeToUAH() {
			this.price = this.price * this.transfer;
		}

		render() {
			const element = document.createElement("div");

			if (this.classes.length === 0) {
				this.classes = "menu__item";
				element.classList.add(this.classes);
			} else {
				this.classes.forEach((className) => element.classList.add(className));
			}

			element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;
			this.parent.append(element);
		}
	}

	getResource("http://localhost:3000/menu").then((data) => {
		data.forEach(({ img, altimg, title, descr, price }) => {
			new MenuCard(
				img,
				altimg,
				title,
				descr,
				price,
				".menu .container"
			).render();
		});
	});

	// Forms

	const forms = document.querySelectorAll("form");
	const message = {
		loading: "img/form/spinner.svg",
		success: "Спасибо! Скоро мы с вами свяжемся",
		failure: "Что-то пошло не так...",
	};

	forms.forEach((item) => {
		bindPostData(item);
	});

	const postData = async (url, data) => {
		let res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: data,
		});

		return await res.json();
	};

	async function getResource(url) {
		let res = await fetch(url);

		if (!res.ok) {
			throw new Error(`Could not fetch ${url}, status: ${res.status}`);
		}

		return await res.json();
	}

	function bindPostData(form) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			let statusMessage = document.createElement("img");
			statusMessage.src = message.loading;
			statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
			form.insertAdjacentElement("afterend", statusMessage);

			const formData = new FormData(form);

			const json = JSON.stringify(Object.fromEntries(formData.entries()));

			postData("http://localhost:3000/requests", json)
				.then((data) => {
					console.log(data);
					showThanksModal(message.success);
					statusMessage.remove();
				})
				.catch(() => {
					showThanksModal(message.failure);
				})
				.finally(() => {
					form.reset();
				});
		});
	}

	function showThanksModal(message) {
		const prevModalDialog = document.querySelector(".modal__dialog");

		prevModalDialog.classList.add("hide");
		openModal();

		const thanksModal = document.createElement("div");
		thanksModal.classList.add("modal__dialog");
		thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;
		document.querySelector(".modal").append(thanksModal);
		setTimeout(() => {
			thanksModal.remove();
			prevModalDialog.classList.add("show");
			prevModalDialog.classList.remove("hide");
			closeModal();
		}, 4000);
	}

	// Slider

	let offset = 0;
	let slideIndex = 1;

	const slides = document.querySelectorAll(".offer__slide"),
		prev = document.querySelector(".offer__slider-prev"),
		next = document.querySelector(".offer__slider-next"),
		total = document.querySelector("#total"),
		current = document.querySelector("#current"),
		slidesWrapper = document.querySelector(".offer__slider-wrapper"),
		width = window.getComputedStyle(slidesWrapper).width,
		slidesField = document.querySelector(".offer__slider-inner"),
        carouselIndicators = document.createElement('div');

    carouselIndicators.classList.add('carousel-indicators');
    slidesWrapper.appendChild(carouselIndicators);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        carouselIndicators.appendChild(dot);
    }

    slidesWrapper.style.position = 'relative';

    dots = document.querySelectorAll('.dot');

    dots[slideIndex - 1].style.opacity = '1';
    
	if (slides.length < 10) {
		total.textContent = `0${slides.length}`;
		current.textContent = `0${slideIndex}`;
	} else {
		total.textContent = slides.length;
		current.textContent = slideIndex;
	}

	slidesField.style.width = 100 * slides.length + "%";
	slidesField.style.display = "flex";
	slidesField.style.transition = "0.5s all";

	slidesWrapper.style.overflow = "hidden";

	slides.forEach((slide) => {
		slide.style.width = width;
	});

	next.addEventListener("click", () => {
		if (offset == +width.slice(0, width.length - 2) * (slides.length - 1)) {
			offset = 0;
		} else {
			offset += +width.slice(0, width.length - 2);
		}

		slidesField.style.transform = `translateX(-${offset}px)`;

		if (slideIndex == slides.length) {
			slideIndex = 1;
		} else {
			slideIndex++;
		}

		if (slides.length < 10) {
			current.textContent = `0${slideIndex}`;
		} else {
			current.textContent = slideIndex;
		}

        dots.forEach(item => {
            item.style.opacity = .5;
        });

        dots[slideIndex - 1].style.opacity = '1';
	});

	prev.addEventListener("click", () => {
		if (offset == 0) {
			offset = +width.slice(0, width.length - 2) * (slides.length - 1);
		} else {
			offset -= +width.slice(0, width.length - 2);
		}

		slidesField.style.transform = `translateX(-${offset}px)`;

		if (slideIndex == 1) {
			slideIndex = slides.length;
		} else {
			slideIndex--;
		}

		if (slides.length < 10) {
			current.textContent = `0${slideIndex}`;
		} else {
			current.textContent = slideIndex;
		}

        dots.forEach(item => {
            item.style.opacity = .5;
        });

        dots[slideIndex - 1].style.opacity = '1';
	});

    //Indicators

    dots.forEach((item, i) => {
        item.addEventListener('click', () => {
            dots.forEach(item => item.style.opacity = .5);
            item.style.opacity = 1;
            current.textContent = `0${i + 1}`;

            offset = 0;
            offset = +width.slice(0, width.length - 2) * i;
            slidesField.style.transform = `translateX(-${offset}px)`;
        });
    });

    // Calculating eating

    const sex = document.querySelectorAll('#gender div'),
        inputForms = document.querySelectorAll('.calculating__choose_medium input'),
        activity = document.querySelectorAll('.calculating__choose_big div'),
        result = document.querySelector('.calculating__result span');

    let sexConst = -161, activityConst = 1.38;
    let height = 0, weight = 0, age = 0;

    sex.forEach((item, i) => {
        item.addEventListener('click', () => {
            sex.forEach(item => item.classList.remove('calculating__choose-item_active'));
            item.classList.add('calculating__choose-item_active');
            i == 0 ? sexConst = -161 : sexConst = +5;
            updateResult();
        });
    });

    activity.forEach((item, i) => {
        item.addEventListener('click', () => {
            activity.forEach(item => item.classList.remove('calculating__choose-item_active'));
            item.classList.add('calculating__choose-item_active');
            switch (i) {
                case 0: activityConst = 1.2; break;
                case 1: activityConst = 1.38; break;
                case 2: activityConst = 1.55; break;
                case 3: activityConst = 1.73; break;
            }
            updateResult();
        });
    });

    inputForms.forEach(item => {
        item.addEventListener('input', () => {
            height = parseFloat(document.querySelector('#height').value) || 0;
            weight = parseFloat(document.querySelector('#weight').value) || 0;
            age = parseFloat(document.querySelector('#age').value) || 0;
            updateResult();
        });
    });

    function updateResult() {
        result.textContent = (height == 0 || weight == 0 || age == 0) ? '____' : calcKkal(sexConst, activityConst, height, weight, age);
    }
    
    function calcKkal(sex, activity, height, weight, age) {
        return Math.round((weight * 10 + height * 6.25 - age * 5 + sex) * activity);
    }

});
