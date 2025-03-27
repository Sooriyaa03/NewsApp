import { Feather } from "@expo/vector-icons";

export const icon = {
    home: (props: any) =>  <Feather name='home' size={24} {...props}/>,
    stock: (props: any) =>  <Feather name='bar-chart' size={24} {...props}/>,
    poll: (props: any) =>  <Feather name='check-circle' size={24} {...props}/>,
    user: (props: any) =>  <Feather name='user' size={24} {...props}/>,
}