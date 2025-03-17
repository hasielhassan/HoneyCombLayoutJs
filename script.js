/**
 * Build a honeycomb layout from a container's data attributes.
 * @param {string} selector - A CSS selector to find the container (e.g. '.honeycomb-container').
 */
function buildHoneycomb(selector) {
    // Select all matching containers
    const containers = document.querySelectorAll(selector);
    if (!containers.length) return;

    // Iterate over each container
    containers.forEach(container => {
        // 1) Read data attributes
        // Orientation can be 'flat-top' or 'pointy-top'
        const orientation = container.dataset.orientationlabel || 'flat-top';
        // Number of rows/cols (integers)
        const rows = parseInt(container.dataset.rowsrange, 10) || 1;
        const cols = parseInt(container.dataset.colsrange, 10) || 1;
        // "size" is the distance from the center of the hex to any corner
        const size = parseFloat(container.dataset.sizerange) || 40;
        // Spacing in pixels between hex centers
        const spacing = parseFloat(container.dataset.spacingrange) || 4;

        // Height margin for the container
        const heightmargin = parseInt(container.dataset.heightmargin, 10) || 1;

        // 2) Gather all <a> items
        const items = Array.from(container.querySelectorAll('a'));

        // Helper function to compute hex position based on row and col
        function getHexPosition(r, c) {
            if (orientation === 'flat-top') {
                // Flat-top layout:
                // Horizontal distance between columns: 1.5 * size + spacing
                // Vertical distance between rows: sqrt(3)*size + spacing
                // Odd column offset in Y by half the vertical distance.
                const x = c * (1.5 * size + spacing);
                const y = r * ((Math.sqrt(3) * size) + spacing) + (c % 2) * (((Math.sqrt(3) * size) + spacing) / 2);
                return { x, y };
            } else {
                // Pointy-top layout:
                // Horizontal distance: sqrt(3)*size + spacing
                // Vertical distance: 1.5*size + spacing
                // Odd row offset in X by half the horizontal distance.
                const x = c * ((Math.sqrt(3) * size) + spacing) + (r % 2) * (((Math.sqrt(3) * size) + spacing) / 2);
                const y = r * (1.5 * size + spacing);
                return { x, y };
            }
        }

        // 3) Position each item absolutely and add hover effect
        items.forEach((item, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            const { x, y } = getHexPosition(r, c);

            // Absolutely position the <a>
            item.style.position = 'absolute';
            item.style.left = x + 'px';
            item.style.top = y + 'px';
            // Each hex's bounding box is 2*size by 2*size if size is "center to corner"
            item.style.width = (2 * size) + 'px';
            item.style.height = (2 * size) + 'px';

            // Add CSS transition for a smooth hover effect
            item.style.transition = 'transform 0.2s ease-out, filter 0.2s ease-out';

            // Add hover effect: slightly scale up and brighten the image
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05)';
                item.style.filter = 'brightness(1.1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
                item.style.filter = 'brightness(1)';
            });
        });

        // 4) Adjust container's size so all items fit
        let maxRight = 0;
        let maxBottom = 0;
        
        items.forEach((item, index) => {
        const r = Math.floor(index / cols);
        const c = index % cols;
        const { x, y } = getHexPosition(r, c);
        
        // Each hex is 2*size wide/tall, so the right edge is x + 2*size
        // and the bottom edge is y + 2*size.
        maxRight = Math.max(maxRight, x + 2 * size);
        maxBottom = Math.max(maxBottom, y + 2 * size);
        });

        // Then set container size based on those maxima
        container.style.width = Math.ceil(maxRight) + 'px';
        container.style.height = Math.ceil(maxBottom + heightmargin) + 'px';
    });
}
