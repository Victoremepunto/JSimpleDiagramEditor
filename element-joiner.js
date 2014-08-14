/**
 * EJoiner - don't know yet what is this, though it should join elements XD 
 */

var EJonier = function(data)
{

    this.currentMousePos = { top: -1, left: -1 };

    this.element = data.element;
    this.type = data.type; // Task-Multi-Choose

    $(this).draggable(
        
    );

    $(this).droppable(

    );

    /*
    this.element = {};
    this.position = {};
    this.width = 0;
    this.height = 0;
    this.up = {};
    this.down = {};
    this.left = {};
    this.right = {};
    this.wide = 0;
    this.zones = [];
    this.name = '';
    this.invaded = {};
    */

    this.recordMousePos();

        this.position=
        {
            left: parseInt(this.element.offset().left),
            top: parseInt(this.element.offset().top)
        };

        this.height = parseInt(this.element.outerHeight());
        this.name = 'center';
        this.wide = typeof(data.wide) !== 'undefined' ? parseInt(data.wide) : 0;

        this.zones.push(this);

        if (this.wide > 0)
        {
            this.defineAreas();
        }

        this.checkAreas();
    }
};
    
$.extend(Area.prototype,
{
    recordMousePos: function()
    {
        $(document).bind('mousemove',{cmp:this.currentMousePos},function(event)
        {
            event.data.cmp.left = event.pageX;
            event.data.cmp.top = event.pageY;
        });
    },

});
