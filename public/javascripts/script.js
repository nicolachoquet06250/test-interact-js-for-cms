const position = { x: 0, y: 0 };

interact('.draggable').draggable({
    listeners: {
        start (event) {
            console.log(event.type, event.target)
        },
        move (event) {
            position.x += event.dx;
            position.y += event.dy;

            event.target.style.transform =
                `translate(${position.x}px, ${position.y}px)`
        },
    }
});

interact('.resize-drag').dropzone({
    accept: '.draggable',
    overlap: 1,

    ondropactivate: event => event.target.classList.add('drop-active'),
    ondragenter: event => {
        var draggableElement = event.relatedTarget;
        var dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        draggableElement.textContent = 'Dragged in'
    },
    ondragleave: event => {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        event.relatedTarget.textContent = 'Dragged out'
    },
    ondrop: event => event.relatedTarget.textContent = 'Dropped',
    ondropdeactivate: event => {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
    }
});

const bootstrap_grid_max_cols = 12;
interact('.resize-drag')
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
    })
    .on('resizemove', event => {
        const device = window.device_mode === 'desktop' ? 'lg' : (window.device_mode === 'tablet' ? 'md' : 'sm');
        const col_1 = Math.round(event.target.parentElement.offsetWidth / bootstrap_grid_max_cols);
        const width = Math.round(event.rect.width);
        const isCol = i => width > col_1 * i && width < col_1 * (i + 1);
        let target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        let last_col = target.getAttribute(`data-last-col-${device}`);
        let last_class = 'col-1';
        for(let classe of target.classList) {
            if(classe.indexOf('col-') !== -1) {
                last_class = classe;
                break;
            }
        }

        let classes = last_col !== null ? `col-${target.getAttribute(`data-last-col-${device}`)}` : last_class;
        for(let i = 1; i <= 12; i++) {
            if(isCol(i)) {
                target.classList.remove(classes);
                classes = `col-${i}`;
                target.classList.add(classes);
                target.setAttribute(`data-last-col-${device}`, i);
                break;
            }
        }

        // update the element's style
        // target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.textContent = classes
    });

function create_page(page_data, first = true, parent = null) {
    if(first) window.page_data = page_data;

    for(let data of page_data) {
        if(data.type === "text") {
            console.log(parent);
            parent.innerHTML = data.content;
        } else {
            let element = document.createElement(data.type);
            for(let _class of data.classes) element.classList.add(_class);
            parent.append(element);
            create_page(data.content, false, element)
        }
    }
}

function get_page(name) {
    return fetch(`/api/page/${name}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json());
}

function save_page(name) {
    return fetch(`/api/page/${name}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(window.page_data)
    }).then(r => r.json());
}

window.addEventListener('load', () => {
    window.device_mode = 'desktop';
    window.page_data = {};
    document.querySelector('#desktop-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('tablet', 'mobile');
        document.querySelector('#mode').classList.add('desktop');
        window.device_mode = 'desktop';
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            for(let i = 0; i <= 12; i++) {
                elem.classList.remove(`col-${i}`);
            }
        }
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            const device = 'lg';
            let last_col = elem.getAttribute(`data-last-col-${device}`);
            let classes = last_col !== null ? `col-${elem.getAttribute(`data-last-col-${device}`)}` : `col-1`;
            elem.classList.add(classes);
            elem.innerHTML = classes;
        }
    });
    document.querySelector('#tablet-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('mobile', 'desktop');
        document.querySelector('#mode').classList.add('tablet');
        window.device_mode = 'tablet';
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            for(let i = 0; i <= 12; i++) {
                elem.classList.remove(`col-${i}`);
            }
        }
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            const device = 'md';
            let last_col = elem.getAttribute(`data-last-col-${device}`);
            let classes = last_col !== null ? `col-${elem.getAttribute(`data-last-col-${device}`)}` : `col-1`;
            elem.classList.add(classes);
            elem.innerHTML = classes;
        }
    });
    document.querySelector('#mobile-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('tablet', 'desktop');
        document.querySelector('#mode').classList.add('mobile');
        window.device_mode = 'mobile';
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            for(let i = 0; i <= 12; i++) {
                elem.classList.remove(`col-${i}`);
            }
        }
        for(let elem of document.querySelectorAll('.row .resize-drag')) {
            const device = 'sm';
            let last_col = elem.getAttribute(`data-last-col-${device}`);
            let classes = last_col !== null ? `col-${elem.getAttribute(`data-last-col-${device}`)}` : `col-1`;
            elem.classList.add(classes);
            elem.innerHTML = classes;
        }
    });

    get_page('index')
        .then(json =>
            create_page(json, true, document.querySelector('#mode'))
        );
});
