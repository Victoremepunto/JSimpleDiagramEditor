/**
 * painter.js
 */

var Painter = function(w)
{
    this.wall = (typeof(w) == 'undefined') ? $('#process') : $('#'+w);
    this.painted = {};
    this.vacuum = 40;
    this.currentMousePos=  { top: -1, left: -1 };
    this.recordMousePos();
    this.init();
};

$.extend(Painter.prototype,
{

    init: function()
    {
        this.listenAreaDrop(this.wall);
        this.createDropZone(this.wall);
        this.initConnections();
    },
    
    initConnections: function()
    {
//        jsPlumb.bind("ready", function() {
            // REMOVE IF UPDATE TO 1.6.X jsPlumb.setContainer($("#container"));
            jsPlumb.importDefaults({
                Container: $('#container'),
                Anchor: "AutoDefault",
                PaintStyle: {
                    strokeStyle: "#C4C9D3", 
                    lineWidth: 2,
                },
                Endpoint: "Blank",
                ConnectionsDetachable:false,
                Connector: ["Flowchart", { gap: 5, stub:[40, 60] } ],
                ConnectionOverlays: [ [ "PlainArrow", { location:1, width:14, height:10 } ] ],
            });
//        });
    },

    createDropZone: function(e)
    {
        e.droppable(
        {
            drop: function(event,ui)
            {
                e.trigger('areaDrop',{
                    position: $(event.target).position(),
                    element: $(ui.helper),
                });
            },
            tolerance: 'touch',
            accept: '.option',
        });
    },

    paintProcess: function(process)
    {
        this.clearWall();
        this.paintNodes(process.getFirst());
    },

    clearWall: function()
    {
        this.wall.children().remove();
        
        for(i=0;i<this.painted.length;i++)
            $(this.painted[i].div).remove();
        this.painted = {};
    },

    repaint: function(process)
    {
        this.clearWall();
        this.paintProcess(process);
    },

    paintNodes: function(node)
    {
        if (typeof(node) == 'undefined')
            return;

        this.paintNode(node);
        this.paintNodes(node.getNext()[0]);
        this.paintNodes(node.getNext()[1]);
    },

    eraseNode: function(id)
    {
        var element = this.painted[id];
        var position = {top: parseInt(element.div.css('top')), left:parseInt(element.div.css('left'))};
        var rel_position = element.node.rel_position;
        var dimensions = {height: element.div.outerHeight(),
                          width:  element.div.outerWidth()};

        if (element.node.getTotalNextNodes() > 1)
            return -1;

        if (Object.keys(this.painted).length > 0)
        {

            // get proper direction to move nodes
            if ( (typeof(element.node.getFirstNext()) != 'undefined') &&
                (element.node.rel_position != element.node.getFirstNext().rel_position) )
                    rel_position = element.node.getFirstNext().rel_position ;

            // not the first element
            if (typeof(rel_position) != 'undefined')
            {
                if (rel_position == 'inside')
                {
                    var container = this.getPainted()[element.node.getPrevious().getId()];
                    var position = { 'top' : parseInt(container.div.css('top')), 
                                     'left': parseInt(container.div.css('left'))};

                    position.top += dimensions.height;
                    //position.left += dimensions.width;

                    var divs = this.getDivsToReallocate(position,'down');

                    if (this.vacuum > 0);
                        dimensions.height -= this.vacuum;

                    this.reallocate(divs,'down',true,dimensions);
                    this.constrain(container.div,element.div);

                }

                else 
                {
                    if (element.node.getType() == 'multi')
                        for (var idx in element.node.getData('nodes'))
                            delete this.painted[element.node.getData('nodes')[idx].getId()];

                    if (element.node.isCorner())
                    {
                            this.swapSiblings(element.div,this.painted[element.node.getFirstNext().getId()].div);
                            position = {top: parseInt(element.div.css('top')), left:parseInt(element.div.css('left'))};
                        //rel_position = element.node.getFirstNext().getRelPosition();
                    }
                }

                var divs = this.getDivsToReallocate(position,rel_position);
                this.reallocate(divs,rel_position,true,dimensions);
            }

/*
            if (typeof(element.node.getFirstNext()) == 'undefined')
                this.eraseConnector(element.node.getPrevious());
*/

            if (typeof(this.painted[id]['connector']) != 'undefined')
                this.eraseConnector(element.node);

            element.div.remove();
            delete this.painted[id];
            $(".placeholder").remove();

            if (Object.keys(this.painted).length == 0)
                this.wall.droppable('enable');
        }
    },

    swapSiblings: function(a,b)
    {
        var position = {'top':parseInt(a.css('top')), 'left':parseInt(a.css('left'))};
        a.css('top',b.css('top'));
        a.css('left',b.css('left'));
        b.css('top',position.top);
        b.css('left',position.left);
    },

    paintNode: function(node)
    {
        var div = this.createDiv(node);
        var connector = undefined;
        var dimensions = { 'height': div.outerHeight(), 'width':  div.outerWidth() };

        if (node.rel_position == 'inside')
        {

            var container = this.getPainted()[node.getPrevious().getId()];
            var position = { 'top' : parseInt(container.div.css('top')),
                             'left': parseInt(container.div.css('left'))};

            position.top += dimensions.height;
            position.left += dimensions.width;

            var divs = this.getDivsToReallocate(position,'down');

            container.div.children("#nodes").append(div);
            this.expand(container.div,div);

            if (this.vacuum > 0);
                dimensions.height -= this.vacuum;

            this.reallocate(divs,'down',false,dimensions);

        }

        else
        {

            var position = this.getWhereToPaint(node);
            var divs = this.getDivsToReallocate(position,node.rel_position);
            this.reallocate(divs,node.rel_position,false,dimensions);

            if (this.vacuum > 0)
                switch(node.rel_position)
                {
                    case 'down'  : position.top  += this.vacuum; break;
                    case 'right' : position.left += this.vacuum; break;
                }

            div.offset(position);
            
            this.addToWall(div);

            var area = new Area({
                element:div,
                wide:this.vacuum,
                areas: this.getAreasForNode(node.getData('type'))
            });

            this.listenAreaInvaded(div);
            this.listenAreaReleased(div);
        }


        this.painted[node.id] = { 'div': div, 'node': node, 'area': area };

        if (typeof(node.getPrevious()) != 'undefined')
            this.painted[node.getId()]['connector'] = this.drawConnector(node);

        var next_node = node.getNext()[(node.getRelPosition() == 'down'?0:1)];

        if (typeof(next_node) != 'undefined')
            this.painted[next_node.getId()]['connector'] = this.drawConnector(next_node);


        if (! this.wall.droppable('option','disabled') && Object.keys(this.painted).length > 0)
            this.wall.droppable('disable');

        jsPlumb.repaintEverything();
    
    },

    drawConnector: function(node)
    {
        var c;
        var from = node.getPrevious().getId().toString();
        var to   = node.getId().toString();

        return ((typeof(from) != 'undefined') && (typeof(to) != 'undefined')) ?
            jsPlumb.connect({'source':from,'target':to}) : undefined;
    },

    eraseConnector: function(node)
    {
        if ((typeof(node) != 'undefined') &&
            (typeof(this.painted[node.getId()]) != 'undefined'))
        {
            jsPlumb.detach(this.painted[node.getId()]['connector']);
            delete this.painted[node.getId()]['connector']
        }
    },

    addToWall: function(div)
    {
        this.wall.append(div);  
    },

    createDiv: function(node)
    {
        var div  = $("<div>");
        var type = node.getData('type');

        div.attr('id',node.id);
        div.attr('data-type',type);
        div.text(node.getData('name'));

        if (node.rel_position == 'inside')
            div.addClass('multiNodeElement');
        else
        {
            /*
            var position = this.getWhereToPaint(node);
            div.css('position','absolute');            
            div.css('top',position.top);
            div.css('left',position.left);
            */
            div.addClass(this.getClassForNode(type));
        }

        div.append(
            $("<div>").
            addClass('close').
            text('x').
            click(function(){
                grid.removeElement($(this).parent().attr('id'));
            })
        );

        if (type == 'multi')
            div.append($("<div>").
            attr('id','nodes').
            addClass('multiNodeContainer')
            );

        return div;
    },

    getWhereToPaint: function(node)
    {
        var rel_position = node.rel_position;
        var position = {top: 0, left: 0}; 

        if (rel_position != undefined)
        {

            var previous = this.painted[node.getPrevious().getId()];
            position = {top: parseInt(previous.div.css('top')), left: parseInt(previous.div.css('left')) };

            switch(rel_position){

                case 'down': position.top += this.getWiderDiv(this.getDivsInLine(position,'down'),'down').outerHeight(); break;
                case 'right': position.left += this.getWiderDiv(this.getDivsInLine(position,'right'),'right').outerWidth(); break;
                case 'inside':
                case 'default': break;
            }

        }

        else
        {
            position.top += this.vacuum;
            position.left += this.vacuum;
        }
        return position;
    },


    getDivsInLine: function (position,direction)
    {
        var divs = [];
        var reference = direction == 'down' ? 'top' : 'left';

        for (var i in this.getPainted())
        {
            var item = this.getPainted()[i];
            
            var element_position = {top: parseInt(item.div.css('top')), left:parseInt(item.div.css('left'))};
            if (element_position[reference] == position[reference])
            //if (item.div.position()[reference] == position[reference])
                divs.push(item.div);
        }
        return divs;
    },

    getWiderDiv: function(divs,direction)
    {
        var reference = direction == 'down' ? 'height' : 'width';
        var wider = divs['0'];

        if (divs.length > 0)
            for (var i in divs)
                if ( ((direction == 'down') && (divs[i].outerHeight() > wider.outerHeight())) ||
                     ((direction == 'right') && (divs[i].outerWidth() > wider.outerWidth())))
                        wider = divs[i]
        return wider;
    },

    getClassForNode: function (data)
    {
        var c;

        switch(data)
        {
            case 'multi' : c = 'multiNode';break;
            default      : c = 'node'; break;
        }
        return c;
    },

    getAreasForNode: function (data)
    {
        var a;

        switch(data)
        {
            case 'multi' : a = ['down','right','center']; break;
            default      : a = ['down','right']; break;
        }
        return a;
    },

    setPalette: function(id)
    {
        var palette = (typeof(id) == 'undefined') ? $('#palette ul') : $('#'+id+' ul');

        palette.children().each(function(index,element)
        {
            var selector = $('#'+element.id);
            selector.addClass('option');
            selector.draggable({
                helper: 'clone',
                scrollSensitivity: 100
            }); 
        });

        this.palette = palette;
    },

    getPainted: function()
    {
        return this.painted;
    },

    getElementsToReallocate: function(position,direction)
    {
        elements=[];

        for(var id in this.getPainted())
        {
            if (this.getPainted()[id].node.rel_position == 'inside')
                continue;

            switch(direction)
            {
                case 'down':
                default:
                {
                if ( $(this.getPainted()[id].div).position().top + $('#container').scrollTop() >= position.top )
                    elements.push(this.getPainted()[id]);
                    break;
                }
                case 'right':
                {
                if ( $(this.getPainted()[id].div).position().left + $('#container').scrollLeft() >= position.left)
                    elements.push(this.getPainted()[id]);
                    break;
                }
            }
        }
        return elements;
    },

    getDivsToReallocate: function(position,direction)
    {
        divs=[];

        for(var id in this.getPainted())
        {
            if (this.getPainted()[id].node.rel_position == 'inside')
                continue;

            switch(direction)
            {
                case 'down':
                default:
                {
                if ( $(this.getPainted()[id].div).position().top + $('#container').scrollTop() >= position.top )
/*
                if (
                    ( parseInt(this.getPainted()[id].div.css('top')) > position.top ) &&
                    ( parseInt(this.getPainted()[id].div.css('left')) >= position.left )
                )
*/
                //if ( $(this.getPainted()[id].div).offset().top  > position.top)
                    divs.push(this.getPainted()[id].div);
                    break;
                }
                case 'right':
                {
/*
                if ( 
                    ( parseInt(this.getPainted()[id].div.css('left')) > position.left ) &&
                    ( parseInt(this.getPainted()[id].div.css('top')) >= position.top )
                )
*/
                if ( $(this.getPainted()[id].div).position().left + $('#container').scrollLeft() >= position.left) 
                    divs.push(this.getPainted()[id].div);
                    break;
                }
            }
        }
        return divs;
    },

    reallocate: function(divs,direction,reverse,dimensions)
    {
        var operation = reverse ? '-=' : '+=';

        for (i=0;i<divs.length;i++)
        {
            switch(direction)
            {
                case 'down':  
                {
                    var distance=dimensions.height+this.vacuum;
                    var offset = divs[i].offset();

                    if (reverse) 
                        offset.top -= distance;
                    else
                        offset.top += distance;

                    divs[i].offset(offset);

                    break;
                }
                case 'right':
                    //var distance=(divs[i].outerWidth())+this.vacuum;
                    //var distance=dimensions.width+this.vacuum;
                    var distance=dimensions.width + this.vacuum;
                    divs[i].css('left',operation+distance);
                    break;
            }

            var element = this.painted[divs[i].attr('id')];

/*
            if (typeof(this.painted[element.node.getPrevious().getId()]) == 'undefined')
*/
            if (
                (typeof(element.node.getPrevious()) == 'undefined') ||
                (typeof(this.painted[element.node.getPrevious().getId()]) == 'undefined'))
                this.eraseConnector(element.node);

            jsPlumb.repaintEverything();
        }
    },

    recordMousePos: function()
    {
        $(document).bind('mousemove',{cmp:this.currentMousePos},function(event)
        {
            event.data.cmp.left = event.pageX;
            event.data.cmp.top = event.pageY;
        });
    },

    listenAreaInvaded: function(element)
    {
        $(element).on('areaInvaded',function(event,data){
            ph = $('<div>');
            $('#container').append(ph);
            ph.addClass('placeholder');
//            ph.attr('node-id',data.getElement());
            ph.css('position','absolute');

/*
            ph.css('top','+='+data.getAreaInvaded().getPosition().top);
            ph.css('left','+='+data.getAreaInvaded().getPosition().left);
*/
            var offset = ph.offset();
            var position = data.getAreaInvaded().getPosition();
            
/*
            position.top += offset.top;
            position.left += offset.left;
*/
            ph.offset(position);
            ph.css('width',data.getAreaInvaded().getWidth());
            ph.css('height',data.getAreaInvaded().getHeight());


            ph.droppable(
            {
                drop: function(event,ui)
                {
                    $(element).trigger('areaDrop',
                        {
                            position: $(event.target).position(),
                            //position: $(event.target).offset(),
                            element: $(ui.helper),
                            area: data,
                        });
                },
                tolerance: 'touch',
                accept: '.option',
            });

        });
    },

    listenAreaReleased: function(element)
    {
        $(element).on('areaReleased',function(event,data){
            $(".placeholder").remove();
        });
    },

    listenAreaDrop: function(element)
    {
        $(element).on('areaDrop',function(event,data)
        {
            $(element).trigger('newNode',data);
        /*
            var n = grid.createNode();
            n.content.text= $(data.element).text();
            n.setPosition(data.position);
            n.moveDown(grid.vacuum);
            n.moveRight(grid.vacuum);
            grid.addNode(n,true);
            grid.paintNodes([n]);
       
        */
        });
    },

    expand: function(container,content)
    {
        container.height('+='+content.outerHeight());
        return container.outerHeight();
    },

    constrain: function(container,content)
        
    {
        container.height('-='+content.outerHeight());
        return container.outerHeight();
    }
    
});
