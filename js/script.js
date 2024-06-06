window.addEventListener('DOMContentLoaded', () => {
    // tabs

    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsParent = document.querySelector('.tabheader__items'),
        tabsContent = document.querySelectorAll('.tabcontent');

    function hideTabsContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active')
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabsContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabsContent();
                    showTabContent(i);
                }
            });
        }
        
    });


    // timer

    const deadline = '2024-07-06';

    setClock();

    function getTimeRemaining() {
        const t = Date.parse(deadline) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor(t / (1000 * 60 * 60) % 24),
            minutes = Math.floor(t / (1000 * 60) % 60),
            seconds = Math.floor(t / 1000 % 60);

        return {
            'total' : t,
            'days' : days,
            'hours' : hours,
            'minutes' : minutes,
            'seconds' : seconds
        }
    }

    function setClock() {
        const timer = document.querySelector('.timer'),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining();

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
                days.innerHTML = '00';
                hours.innerHTML = '00';
                minutes.innerHTML = '00';
                seconds.innerHTML = '00';
            }
        }
    }

    function getZero(num) {
        if (0 <= num && num < 10) {
            return `0${num}`;

        } else {
            return num;
        }
    }

    // Modal

    const btns = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal'),
        closeBtn = document.querySelector('[data-close]'),
        modalTimerId = setTimeout(openModal, 1000);

    btns.forEach(item => {
        item.addEventListener('click', openModal);
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.classList.add('hide');
        document.body.style.overflow = '';
    }

    function showModalByScroll() {
        if(window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
            // удаляет обработчик, после первого раза, когда юезр
            // проскролил страницу до конца
            // Т.е. модальное окно появиться только один раз
        }
    }

    window.addEventListener('scroll', showModalByScroll);
})