const position = {x: 0, y: 0};

interact('.draggable').draggable({
    listeners: {
        start(event) {
            console.log(event.type, event.target)
        },
        move(event) {
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
        edges: {left: true, right: true, bottom: true, top: true},
    })
    .on('resizemove', event => {
        const device = window.device_mode === 'desktop' ? 'lg' : (window.device_mode === 'tablet' ? 'md' : 'sm');
        const col_1 = Math.round(event.target.parentElement.offsetWidth / bootstrap_grid_max_cols);
        const width = Math.round(event.rect.width);
        const isCol = i => width > col_1 * i && width < col_1 * (i + 1);
        const isOffset = (i, x) => x > col_1 * i && x < col_1 * (i + 1);
        let target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        let last_col = target.getAttribute(`data-last-col-${device}`);
        let last_offset = target.getAttribute(`data-last-offset-${device}`);
        let last_class = 'col-1';
        let last_class_offset = 'offset-0';
        for (let classe of target.classList) {
            if (classe.indexOf('col-') !== -1) {
                last_class = classe;
                break;
            }
        }

        let classes = last_col !== null ? `col-${target.getAttribute(`data-last-col-${device}`)}` : last_class;
        for (let i = 1; i <= 12; i++) {
            if (isCol(i)) {
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

        let classes_offset = last_offset !== null ? `offset-${target.getAttribute(`data-last-offset-${device}`)}` : last_class_offset;
        for (let i = 0; i <= 11; i++) {
            if (isOffset(i, x)) {
                target.classList.remove(classes_offset);
                classes_offset = `offset-${i}`;
                target.classList.add(classes_offset);
                target.setAttribute(`data-last-offset-${device}`, i);
                break;
            }
        }

        // target.style.webkitTransform = target.style.transform =
        //     'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.querySelector('span').textContent = classes;

        updates[target.tagName.toLowerCase()](target);

    });

function create_page(page_data, page_name, first = true, parent = null, json_index = '') {
    window.page_name = page_name;
    const device = window.device_mode === 'desktop' ? 'lg' : (window.device_mode === 'tablet' ? 'md' : 'sm');
    if (first) window.page_data = page_data;

    let index = 0;
    for (let data of page_data) {
        let current_json_index = json_index + '[' + index + '].content';
        let classes = data.classes || [];
        let type = data.type;
        let style = data.style;

        if (data.type === "text") type = 'span';

        let element = document.createElement(type);
        element.setAttribute('data-json-index', current_json_index);
        if(style !== undefined) {
            for(let prop in style) {
                element.style[prop] = style[prop];
            }
        }
        element.classList.add(...classes);

        for(let i = 1; i <= 10; i++) {
            if(element.classList.contains(`col-lg-${i}`)) {
                element.classList.remove(`col-lg-${i}`);
                element.classList.add(`col-${i}`);
                element.setAttribute('data-last-col-lg', i.toString());
            }
            if(element.classList.contains(`col-md-${i}`)) {
                element.classList.remove(`col-md-${i}`);
                element.setAttribute('data-last-col-md', i.toString());
            }
            if(element.classList.contains(`col-sm-${i}`)) {
                element.classList.remove(`col-sm-${i}`);
                element.setAttribute('data-last-col-sm', i.toString());
            }

            if(element.classList.contains(`offset-lg-${i}`)) {
                element.classList.remove(`offset-lg-${i}`);
                element.classList.add(`offset-${i}`);
                element.setAttribute('data-last-offset-lg', i.toString());
            }
            if(element.classList.contains(`offset-md-${i}`)) {
                element.classList.remove(`offset-md-${i}`);
                element.setAttribute('data-last-offset-md', i.toString());
            }
            if(element.classList.contains(`offset-sm-${i}`)) {
                element.classList.remove(`offset-sm-${i}`);
                element.setAttribute('data-last-offset-sm', i.toString());
            }
        }

        if (data.type === 'text') element.innerHTML = data.content;
        else create_page(data.content, page_name, false, element, current_json_index);

        parent.append(element);
        index++;
    }
}

function get_page(name) {
    return new Promise((resolve, reject) => {
        fetch(`/api/page/${name}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(r => r.json()).then(json => resolve({
            data: json,
            page_name: name
        })).catch(reject);
    });
}

var updates = {
    div: function (div) {
        let json_index = div.getAttribute('data-json-index').substr(0, div.getAttribute('data-json-index').length - '.content'.length);
        let classes = [];
        for(let _class of div.classList.values()) {
            if(_class.indexOf('col-') === -1) classes.push(_class);
        }
        if(div.getAttribute('data-last-col-sm') !== null && div.getAttribute('data-last-col-sm') !== undefined) {
            classes.push('col-sm-' + div.getAttribute('data-last-col-sm'));
        }
        if(div.getAttribute('data-last-col-md') !== null && div.getAttribute('data-last-col-md') !== undefined) {
            classes.push('col-md-' + div.getAttribute('data-last-col-md'));
        }
        if(div.getAttribute('data-last-col-lg') !== null && div.getAttribute('data-last-col-lg') !== undefined) {
            classes.push('col-lg-' + div.getAttribute('data-last-col-lg'));
        }

        let div_content = JSON.stringify({
            type: 'div',
            classes: classes,
            style: div.style,
            content: [{type: 'text', content: div.querySelector('span').textContent}]
        });

        eval('window.page_data' + json_index + ' = ' + div_content);
        save_page(window.page_name).then(json => console.log(json))
    }
};

function save_page(name) {
    return fetch(`/api/page/${name}`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(window.page_data)
    }).then(r => r.json());
}

function create_buttons(parent, buttons) {
    let row = document.createElement('div');
    row.classList.add('row');
    for (let button of buttons) {
        let col = document.createElement('div');
        col.classList.add('col', 'text-center');
        let _button = document.createElement('button');
        _button.classList.add('btn', 'btn-primary');
        _button.setAttribute('type', 'button');
        _button.innerHTML = button.text;
        _button.addEventListener('click', button.on_click);
        col.append(_button);
        row.append(col);
    }

    parent.append(row);
    let spacer = document.createElement('div');
    spacer.classList.add('row');
    let spacer_col = document.createElement('div');
    spacer_col.classList.add('col-12', 'mb-2');
    spacer.append(spacer_col);
    parent.append(spacer);
}

function mode_switcher(activate = true, switcher_container = null, buttons_parent = null) {
    let _switch = {
        desktop: switcher_container => {
            switcher_container.classList.remove('tablet', 'mobile');
            switcher_container.classList.add('desktop');
        },
        tablet: switcher_container => {
            switcher_container.classList.remove('desktop', 'mobile');
            switcher_container.classList.add('tablet');
        },
        mobile: switcher_container => {
            switcher_container.classList.remove('tablet', 'desktop');
            switcher_container.classList.add('mobile');
        }
    };

    function button_callback(switcher_container, device_mode) {
        const device = device_mode === 'desktop' ? 'lg' : (device_mode === 'tablet' ? 'md' : 'sm');
        _switch[device_mode](switcher_container);
        window.device_mode = device_mode;
        for (let elem of document.querySelectorAll('.row .resize-drag')) {
            for (let i = 0; i <= 12; i++) {
                elem.classList.remove(`col-${i}`);
                elem.classList.remove(`offset-${i}`);
            }
        }
        for (let elem of document.querySelectorAll('.row .resize-drag')) {
            let last_col = elem.getAttribute(`data-last-col-${device}`);
            let last_offset = elem.getAttribute(`data-last-offset-${device}`);
            let col_class = last_col !== null ? `col-${elem.getAttribute(`data-last-col-${device}`)}` : `col-1`;
            let offset_class = last_offset !== null ? `offset-${elem.getAttribute(`data-last-offset-${device}`)}` : `offset-0`;
            elem.classList.add(col_class, offset_class);
            elem.innerHTML = col_class + ' ' + offset_class;
        }
    }

    if (activate) {
        window.device_mode = 'desktop';
        create_buttons(buttons_parent, [
            {
                text: 'Desktop',
                on_click: () => button_callback(switcher_container, 'desktop')
            },
            {
                text: 'Tablet',
                on_click: () => button_callback(switcher_container, 'tablet')
            },
            {
                text: 'Mobile',
                on_click: () => button_callback(switcher_container, 'mobile')
            }
        ]);
    }
}

window.addEventListener('load', () => {
    window.page_data = {};
    mode_switcher(true,
        document.querySelector('.mode_switcher-container'),
        document.querySelector('.mode_switcher-buttons')
    );

    get_page('index')
        .then(json =>
            create_page(json.data, json.page_name, true, document.querySelector('.mode_switcher-container'))
        );
});
