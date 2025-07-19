import { Product } from "../models/Products.ts";

export async function upload(){
    try {
        await Product.create({
            Country:'Moldova',
            ISP:[{
                name:'Unite',
                period:[{
                    duration:'1',
                    price:2
                },
                {
                    duration:'7',
                    price:10
                },
                {
                    duration:'14',
                    price:15
                },{
                    duration:'30',
                    price:25
                }]
            },
            {
                name:'Orange',
                period:[{
                    duration:'1',
                    price:2
                },
                {
                    duration:'7',
                    price:10
                },
                {
                    duration:'14',
                    price:15
                },{
                    duration:'30',
                    price:25
                }]
            },
            {
                name:'Moldocell',
                period:[{
                    duration:'1',
                    price:2
                },
                {
                    duration:'7',
                    price:10
                },
                {
                    duration:'14',
                    price:15
                },{
                    duration:'30',
                    price:25
                }]
            }
        ]
        })
    } catch (error) {
        console.error(error);
    }
};