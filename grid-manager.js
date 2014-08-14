/**
 * Grid Manager 
 */

var GridManager = function(d)
{
    this.process;
    this.painter;
    this.container;

    this.init(d);
}

$.extend(GridManager.prototype,
{
    init: function(data)
    {

        if (typeof(data) != 'undefined')
        {
            this.container = (typeof(data.container) != 'undefined') ?
                data.container : 'container';

            this.process = (typeof(data.process) != 'undefined')?
                data.process : new Process();

            this.painter = new Painter(this.container);

            this.painter.setPalette(
                (typeof(data.chooser != 'undefined')) ?
                data.choooser : undefined
            );

            this.painter.paintProcess(this.process);
        }

        $(document).on('newNode',function(event,data)
        {
    
        if (typeof(data.area) != 'undefined')
        {
            grid.addElement(
                $(data.element),
                $(data.area.element).attr('id'),
                //$(data.element).attr('id'),
                data.area.getInvaded()
            );
        }
        else
        {
            console.log('under construction...');
            grid.addElement(data.element);
        }

/**********
            var area_invaded = (typeof(data.area) != 'undefined') ?
                data.area.getInvaded() : 'down';

            grid.addElement(
                $(data.element),
                $(data.area.element).attr('id'),
                //$(data.element).attr('id'),
                area_invaded
                //data.area.getInvaded()
            );

**********/
        });
    },

    //addElement: function(id,former_id,where)
    addElement: function(element,former_id,where)
    {
        //node = this.process.createNode(id);
        node = this.process.createNode(element.attr('id'),element.attr('data-type'),element.text());
        this.process.insertNode(node,former_id,where);
        this.painter.paintNode(node);
    },

    removeElement: function(id)
    {
        this.painter.eraseNode(id);
        //this.painter.deleteNode(id);
        this.process.removeNodes(id);
    },

    draw: function()
    {
        this.painter.paintProcess(this.process);
    },

    clear: function()
    {
        this.painter.clearWall();
    }

});
