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
        const col_1 = Math.round(event.target.parentElement.offsetWidth / bootstrap_grid_max_cols);
        const width = Math.round(event.rect.width);
        const isCol = i => width > col_1 * i && width < col_1 * (i + 1);
        let target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        let last_col = target.getAttribute('data-last-col');

        let classes = last_col !== null ? `col-${target.getAttribute('data-last-col')}` : 'col-1';
        for(let i = 1; i <= 12; i++) {
            if(isCol(i)) {
                target.classList.remove(classes);
                classes = `col-${i}`;
                target.classList.add(classes);
                target.setAttribute('data-last-col', i);
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

window.addEventListener('load', () => {
    document.querySelector('#desktop-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('tablet', 'mobile');
        document.querySelector('#mode').classList.add('desktop');
    });
    document.querySelector('#mobile-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('tablet', 'desktop');
        document.querySelector('#mode').classList.add('mobile');
    });
    document.querySelector('#tablet-btn').addEventListener('click', () => {
        document.querySelector('#mode').classList.remove('mobile', 'desktop');
        document.querySelector('#mode').classList.add('tablet');
    });
});
