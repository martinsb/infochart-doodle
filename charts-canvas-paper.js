(function(win, paper) {

    var XYAxisChart = (function() {
        function XYChart(project) {
            this._project = project;
            this._allSeries = [];
            this._categoryLabels = null;

            this._seriesTypes = {};
        }

        XYChart.prototype.render = function() {
            var viewSize = this._project.view.viewSize,
                viewWidth = viewSize.getWidth(),
                viewHeight = viewSize.getHeight();

            var changeColor = function(e) {
                e.target.fillColor = 'red';
            };

            var renderedSeries = {};

            this._allSeries.forEach(function(series) {
                var seriesCount = series.values.length,
                    high = Math.max.apply(null, series.values);

                if (series.type === 'bar') {
                    if (!(series.type in renderedSeries)) {
                        renderedSeries[series.type] = 0;
                    }


                    var counter = 0,
                        halfGap = series.gap / 2,
                        totalSlotWidth = (viewWidth - halfGap) / seriesCount,
                        seriesIndex = renderedSeries[series.type],
                        barWidth = (totalSlotWidth - halfGap) / this._seriesTypes[series.type];

                    series.values.forEach(function(value) {
                        var barHeight = value / high * viewHeight,
                            xOffset = totalSlotWidth * counter,
                            barOffset = xOffset + halfGap + barWidth * seriesIndex,
                            point = new paper.Point(barOffset, viewHeight - barHeight);

                        var bar = new paper.Path.Rectangle(point, new paper.Size(barWidth, barHeight));
                        bar.fillColor = series.options.fillColor || 'black';

                        bar.on('click', changeColor);

                        var text = new paper.PointText();
                        text.content = value.toString();
                        text.style = {
                            fillColor: 'white'
                        };
                        var textBounds = text.bounds;
                        var textOffset = barOffset + (barWidth - textBounds.getWidth()) / 2;
                        text.position = new paper.Point(textOffset, viewHeight - 20);

                        counter++;
                    }.bind(this));

                    renderedSeries[series.type]++;
                }
                else if (series.type === 'line') {
                    var counter = 0,
                        halfGap = series.gap / 2,
                        slotWidth = (viewWidth - halfGap) / seriesCount,
                        path = new paper.Path();

                    path.strokeColor = series.options.strokeColor;
                    path.strokeWidth = 3;

                    series.values.forEach(function(value) {
                        var x = halfGap / 2 + slotWidth * counter + slotWidth / 2,
                            y = value / high * viewHeight;

                        var circle = new paper.Path.Circle(new paper.Point(x, y), 10);
                        circle.fillColor = series.options.strokeColor;

                        path.add(new paper.Point(x, y));

                        counter++;
                    }.bind(this));
                }
                else {
                    throw new Error('Chart type not supported: ' + series.type);
                }
            }.bind(this));

            this._project.view.draw();
        };

        XYChart.prototype.addSeries = function(values, seriesType, options) {
            var opts = options || {};
            this._allSeries.push({
                values: values,
                type: seriesType,
                gap: 30,
                options: opts
            });
            if (!(seriesType in this._seriesTypes)) {
                this._seriesTypes[seriesType] = 0;
            }
            this._seriesTypes[seriesType]++;
        };

        XYChart.prototype.setCategory = function(category) {
            this._categoryLabels = category;
        };

        return XYChart;
    })();
    
    function PaperFactory() {
    }

    PaperFactory.prototype.createChart = function(type, canvas) {
        if (type === 'xy') {
            paper.setup(canvas);
            return new XYAxisChart(paper.project);
        }
        return null;
    };

    win.PaperChartFactory = PaperFactory;

})(this, paper);
