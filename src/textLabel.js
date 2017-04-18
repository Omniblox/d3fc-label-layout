import { select } from 'd3-selection';
import functor from './util/functor';
import { dataJoin as dataJoinUtil } from 'd3fc-data-join';

export default (layoutStrategy) => {

    let padding = 10;
    let value = (x) => x;

    const textJoin = dataJoinUtil('text', 'title');
    const noteJoin = dataJoinUtil('text', 'note');
    const rectJoin = dataJoinUtil('rect');
    const pointJoin = dataJoinUtil('circle', 'label-point');
    const anchorLineJoin = dataJoinUtil('line', 'label-line');
    const borderLineJoin = dataJoinUtil('line', 'label-border');

    const textLabel = (selection) => {
        selection.each((data, index, group) => {

            const node = group[index];
            const nodeSelection = select(node);

            let width = Number(node.getAttribute('layout-width'));
            let height = Number(node.getAttribute('layout-height'));
            let rect = rectJoin(nodeSelection, [data]);
            rect.attr('width', width)
                .attr('height', height);

            let anchorX = Number(node.getAttribute('anchor-x'));
            let anchorY = Number(node.getAttribute('anchor-y'));
            /*
            let circle = pointJoin(nodeSelection, [data]);
            circle.attr('r', 2)
                .attr('cx', anchorX)
                .attr('cy', anchorY);
            */
            /*

              (lineX1, lineY1)
                \
                 \
                 (lineX2, lineY2)----(lineX3, lineY3)

            */

            let lineX1, lineY1, lineX2, lineY2, lineX3, lineY3 = 0

            // always
            lineX1 = anchorX;
            lineY1 = anchorY;

            // most of the time
            lineX3 = width;

            // top left
            if((anchorX == 0) && (anchorY == 0)){
              lineX2 = padding;
              lineY2 = padding;
            }

            // top right
            if(anchorX == width && anchorY == 0){
              lineX2 = width - padding;
              lineY2 = padding;
              lineX3 = 0;
            }

            // bottom right
            if(anchorX == width && anchorY == height){
              lineX2 = anchorX - padding;
              lineY2 = anchorY - padding;
              lineX3 = 0;
            }

            // bottom left
            if(anchorX == 0 && anchorY == height){
              lineX2 = anchorX + padding;
              lineY2 = anchorY - padding;
            }

            // middle right
            if (anchorX == width && (0 < anchorY && anchorY < height)) {
              lineX2 = anchorX - padding;
              lineY2 = height - padding;
              lineX3 = 0;
            }

            // middle left
            if (anchorX == 0 && (0 < anchorY && anchorY < height)) {
              lineX2 = anchorX + padding;
              lineY2 = height - padding;
            }

            // bottom center
            if (( 0 < anchorX && anchorX < width) && anchorY == height) {
              lineX2 = padding;
              lineY2 = height - padding;
            }

            // top center
            if (( 0 < anchorX && anchorX < width) && anchorY == 0) {
              lineX2 = padding;
              lineY2 = padding;
            }

            // always. yes, i could just use lineY2 below, but i think this is a little easier to read
            lineY3 = lineY2;

            let anchorLine = anchorLineJoin(nodeSelection, [data]);
            anchorLine.attr('x1', lineX1)
                .attr('y1', lineY1)
                .attr('x2', lineX2)
                .attr('y2', lineY2);

            let borderline = borderLineJoin(nodeSelection, [data]);
            borderline.attr('x1', lineX2)
                .attr('y1', lineY2)
                .attr('x2', lineX3)
                .attr('y2', lineY3);

            let text = textJoin(nodeSelection, [data]);
            text.enter()
                .attr('dy', '0.9em')
                .attr('transform', `translate(${padding}, ${padding})`);
            text.text(value);

            // let note = noteJoin(nodeSelection, [data]);
            // note.enter()
            //     .attr('dy', '2em')
            //     .attr('transform', `translate(${padding}, ${padding})`);
            // note.text("note");

        });
    };

    textLabel.padding = (...args) => {
        if (!args.length) {
            return padding;
        }
        padding = args[0];
        return textLabel;
    };

    textLabel.value = (...args) => {
        if (!args.length) {
            return value;
        }
        value = functor(args[0]);
        return textLabel;
    };

    return textLabel;
};
