function DrawingManagement(ws) {
    var canvas = new fabric.Canvas('canvas');
    canvas.setHeight(350);
    canvas.setWidth(350);
    canvas.freeDrawingBrush.color = 'green';
    canvas.freeDrawingBrush.lineWidth = 10;

    canvas.on('path:created', function(e) {
        sendData('Path', e.path, 'add');
    });

    this.addCircle = function() {
        var obj = {
            radius: 20,
            fill: 'green',
            left: 100,
            top: 100
        };
        sendData('Circle', obj, 'add');
    };
    this.addRectangle = function() {
        var obj = {
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red'
        };
        sendData('Rectangle', obj, 'add');
    };
    this.addTriangle = function() {
        var obj = {
            width: 20,
            height: 30,
            fill: 'blue',
            left: 50,
            top: 50
        };
        sendData('Triangle', obj, 'add');
    };
    this.getPencil = function() {
        canvas.isDrawingMode = true;
    };
    this.getSelection = function() {
        canvas.isDrawingMode = false;
    };
    this.clearAll = function(type, info) {
        sendData('', '', 'clearAll');
    };
    146
    this.addObject = function(type, info) {
        var shape;
        if (type == 'Triangle') {
            shape = new fabric.Triangle(info);
        } else if (type == 'Rectangle') {
            shape = new fabric.Rect(info);
        } else if (type == 'Circle') {
            shape = new fabric.Circle(info);
        } else if (type == 'Path') {
            console.log('path creation');
            shape = createPath(info);
        }

        canvas.add(shape);
    };
    this.clearObjects = function(type, info) {
        canvas.clear();
    };

    function sendData(type, info, operation) {
        ws.send(JSON.stringify({
            'section': 'drawings',
            'data': {
                'operation': operation,
                'type': type,
                'info': info,
            }
        }));
    }

    function sendObject(type, obj) {
        ws.send(JSON.stringify({ 'type': type, 'data': obj }));
    }

    function createPath(obj) {
        shape = new fabric.Path(obj.path);
        shape.stroke = obj.stroke;
        shape.strokeLineCap = obj.strokeLineCap;
        shape.strokeLineJoin = obj.strokeLineJoin;
        shape.strokeWidth = obj.strokeWidth;
        shape.strokeDashArray = null;
        shape.fill = null;
        return shape;
    }
}