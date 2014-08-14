
var binaryTree = function(data)
{
    this.root={}; // NODE;
    this.nodes={};
};

$.extend(binaryTree.prototype,
{

    setRoot: function(n)
    {
        this.addNode(n);
        this.root = n;
    },

    getRoot: function()
    {
        return this.root;
    },

    dropNode: function(n)
    {
        index = $.inArray(n,this.nodes);
        if (index > -1)
            this.nodes.splice(index,1);
    },

    addNode: function(n)
    {
        
    },

    lookop: function(node,id)
    {
        if (node == null)
            return false;
        else
            if (id == node.data.id)
                return true;
            else
    },

};
