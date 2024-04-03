const {GraphQLObjectType , GraphQLID , GraphQLString,GraphQLList,GraphQLNonNull, GraphQLSchema, GraphQLEnumType} = require('graphql')

// mongoose models
const Project = require('../models/Project')
const Client = require('../models/Client')

//Client Type

const ClientType =new GraphQLObjectType({
    name : 'client',
    fields : () =>({
        id : {type : GraphQLID},
        name:{type : GraphQLString},
        email:{type : GraphQLString},  
        phone : {type : GraphQLString},
        projects : {
            type : GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find({ ClientId: parent.id })
            }
        } 
    }) 
})

//Project type
const ProjectType = new GraphQLObjectType({
    name:'project',
    fields:()=>({
        id : {type : GraphQLID},
        name:{type : GraphQLString},
        description:{type : GraphQLString},  
        status : {type : GraphQLString},
        client:{
            type:ClientType,
            resolve(parent,args){
                return Client.findById(parent.ClientId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields :{
        clients: {
            type: new GraphQLList(ClientType),
            resolve() {
                return Client.find();
            }
        },
        client : {
            type : ClientType,
            args:{id : {type : GraphQLID}},
            resolve(parent , args){
                return Client.findById(args.id)
            }
        },
        projects:{
            type : new GraphQLList(ProjectType),
            resolve(){
                return Project.find()
            }
        },
        project:{
            type:ProjectType,
            args :{id : {type : GraphQLID}},
            resolve(parent , args){
                return Project.findById(args.id)
            }
        }
        
    }
})

const mutation = new GraphQLObjectType({
    name : 'MutationType',
    fields : {
        //adding a client
        addClient:{
            type:ClientType,
            args : {
                name : {type : GraphQLNonNull(GraphQLString)},
                email : {type : GraphQLNonNull(GraphQLString)},
                phone : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve(parent ,args){
                const client = new Client({
                    name: args.name,
                    email : args.email,
                    phone : args.phone
                })
                return client.save()
            }
        },
        // deleting a client
        deleteClient:{
            type: ClientType,
            args : {
                id : {type : GraphQLNonNull(GraphQLID)}
            },
            resolve(parent , args){
                return Client.findByIdAndDelete(args.id)
            }
        },
        //add a project
        addProject : {
            type :ProjectType,
            args : {
                name : {type : GraphQLNonNull(GraphQLString)},
                description : {type : GraphQLNonNull(GraphQLString)},
                status : {
                    type : new GraphQLEnumType({
                        name : 'projectStatus',
                        values : {
                            'new' : {value : 'not started'},
                            'progress' : {value :  'In progress'},
                            'completed' : {value : 'active'}
                        }
                    }),
                    defaultValue : 'not started'
                },
                clientId : { type : GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const project = new Project({
                    name : args.name,
                    description:args.description,
                    status:args.status,
                    ClientId : args.clientId
                })
                return project.save()
            }
        },
        //delete a project
        deleteProject : {
            type : ProjectType,
            args : {
                id :{type : GraphQLNonNull(GraphQLID)} 
            },
            resolve(parent , args){
                return Project.findByIdAndDelete(args.id)
            }
        },
        //update a project
        updateProject : {
            type:ProjectType,
            args: {
                id:{type: GraphQLNonNull(GraphQLID)},
                name:{type : GraphQLString},
                description : {type : GraphQLString},
                status : {
                    type : new GraphQLEnumType({
                        name : 'projectStatusupdate',
                        values : {
                            'new' : {value : 'not started'},
                            'progress' : {value :  'In progress'},
                            'completed' : {value : 'active'}
                        }
                    }),
                }

            },
            resolve(parent, args){
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set:{
                            name : args.name,
                            description:args.description,
                            status : args.status
                        }
                    },
                    {new: true}
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query : RootQuery,  
    mutation
})