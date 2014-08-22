/**
 * node.js Node class.
 */
var Node = function(data)
{
    this.id;
    this.next; // 2 elements max
    this.previous; 
    this.data;
    this.rel_position; // from previous node
    this.positions;

    this.init(data);
};

$.extend(Node.prototype,
{
    init: function(data)
    {
        this.next = [undefined,undefined];
        this.positions = ['down','right','inside'];
        this.previous = undefined;
        this.rel_position = undefined;
        this.data={'nodes':{}, 'name':'', };
        this.setId('-1');
        this.setData('type','simple');

        if (typeof(data) != 'undefined')
        {
            if (typeof(data['id']) != 'undefined')
                this.setId(data['id']);

            if (typeof(data['type']) != 'undefined')
                this.setData('type',data['type']);
        }

        return this;
    },

    getId: function()
    {
        return this.id;
    },

    setId: function(id)
    {
        this.id = id;
        return this;
    },

    addNext: function(node,index)
    {
        /*
        if ((index < this.getNext().length) && (index >= 0))
        {
            
            this.next[index] = node;
            node.setPrevious(this);
        }
        else
            return -1;
        return this;
        */

        try{
            if ((index > this.getNext().length) || (index < 0))
                throw "Provided index '"+index+"' is not valid";
            else if (typeof(node) != 'undefined') 
            {
                this.next[index] = node;
                node.setPrevious(this);
            }
        } catch(err) {
            alert(err);
        }
        return this;
    },

    removeNext: function(node)
    {
        index = $.inArray(node,this.next);
        //if ((this.getNext().length <= 1) && (index != -1))
        if (index != -1)
                delete this.next[index];
            else
                return -1;
        return this;
        
    },

    getNext: function()
    {
        return this.next;
    },

    getRelPosition: function()
    {
        return this.rel_position;
    },

    setRelPosition: function(pos)
    {
        if ($.inArray(pos,this.getPositions()) != -1)
            this.rel_position = pos;
        return this;
    },

    getPositions: function()
    {
        return this.positions;
    },

    setPrevious: function(node)
    {
        this.previous = node;

        /*
        if (typeof(node) == 'undefined')
            this.rel_position = undefined;
        else
            this.rel_position = ($.inArray(this,node.getNext()) == 0) ? 
                'down':
                'right';
        */

        if (typeof(node) == 'undefined')
            this.rel_position = undefined;
        else
        
        switch($.inArray(this,node.getNext()))
        {
            case 0: this.rel_position = 'down';break;
            case 1: this.rel_position = 'right';break;
            case -1: this.rel_position = 'inside';break;
        }

        return this;  
    },

    getPrevious: function()
    {
        return this.previous;
    },

    getData: function(i)
    {
        return (typeof(i) == 'undefined') ? this.data : this.data[i];
    },

    setData: function(i,v)
    {
        this.data[i] = v;
        return this;
    },

    getTotalNextNodes: function()
    {
        var count=0;
        $.each(this.getNext(),function(index,value){
            if (! $.isEmptyObject(value))
                count++;
        });
        return count;
    },

    getFirstNext: function()
    {
        for (i=0;i<this.getNext().length;i++)
            if (typeof(this.getNext()[i]) != 'undefined')
                return this.getNext()[i];
        return;
    },

    getType: function()
    {
        return this.getData('type');
    },

    addNode: function(node)
    {
        try
        {
            if (this.getData('type') != 'multi')
                throw "Error, not a multi node!" ;
            else if (typeof(node) == 'undefined')
                throw "node not defined!";
            else
            {
                this.getData('nodes')[node.getId()] = node;
                node.setPrevious(this);
            }
        } catch(err)
        {
            alert(err);
        }
        return this;
    },

    getFirstNodeOnDirection: function(direction)
    {
        if (this.getRelPosition() == direction)
            return this.getPrevious();
        else
        if (typeof(this.getRelPosition()) ==  'undefined')
            return undefined;
        else
            return this.getPrevious().getFirstNodeOnDirection(direction);
    },
    
    isCorner: function()
    {
        return ((this.getTotalNextNodes() == 1) && 
            (typeof(this.getRelPosition()) != 'undefined') &&
            (this.getFirstNext().getRelPosition() != this.getRelPosition()));
    },

/*
    toString: function()
    {
        var node="Hi, I'm a node, my id is: "+this.id+"\n";
        node+="my previous node says: "+this.previous+"\n";
        node+="my next node under me says: "+this.previous+"\n";
        node+="my next node to the right says: "+this.previous+"\n";
        return node;
    }, 
*/
});
