import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from "@mui/material/Grid";
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red, green, yellow, orange, blue } from '@mui/material/colors';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AddToDriveTwoTone, Navigation } from '@mui/icons-material';
import { generateRequestConfig, generateURL } from 'config';
import { resourceLimits } from 'worker_threads';
import AuthContextProvider, { useAuth } from 'contexts/AuthContext';
import PostPage from './PostPage';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { isConstructorDeclaration } from 'typescript';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


export default function RecipeReviewCard(props: any) {

  const [likeResult, setLikeResult] = React.useState(props.value);
  const [hasError, setErrors] = React.useState(false);
  const [valueVote, setValueVote] = React.useState(-2);
  const [hasVote, setHasVote] = React.useState(false);
  const navigate = useNavigate();

  const [expanded, setExpanded] = React.useState(false);
  const colors = [red[500], green[500], yellow[500], orange[500], blue[500]]
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

    const onVoteUpdate = async (_id_posts: number, _value: number) => {
      const data = {id_posts : _id_posts, value: _value};
      await fetch(generateURL('/posts/updateVote'), generateRequestConfig({
        method: 'POST',
        body: JSON.stringify(data)
      }));
    };

    const onVoteInsert = async (_id_posts: number, _value: number) => {
      const data = {id_posts : _id_posts, value: _value};
      await fetch(generateURL('/posts/insertVote'), generateRequestConfig({
        method: 'POST',
        body: JSON.stringify(data)
      }));
    };

    const [loginData, setLoginData] = React.useState<any>({nickname: null, email: null});
    const location = useLocation();
    const { data, error, isLoading,  } = useQuery(['me', location.pathname], () => fetch(generateURL('/auth/me'), generateRequestConfig({
      method: 'GET',
    })).then(res => {
      res.json();
      // console.log(data);
      if(data != undefined){
        setLoginData(data);
      }
    }), {
      refetchOnWindowFocus: false,
      retry: false,
    });

    async function fetchDataLikeResult(id_posts: number, id_users: number) {
      if( id_posts == undefined || id_users == undefined){
        return;
      }
      // console.log('fetching');
      let path = '/posts/likeResultUser/'+id_posts.toString()+'/'+id_users.toString();
      const res = await fetch(generateURL(path), generateRequestConfig({
        method: 'GET'
      }));

      res
        .json()
        .then(res => {
          // console.log("res:--------");
          // console.log(res);
          setValueVote(res.value);
        })
        .catch(err => setErrors(err));
    }

    async function fetchDataLikeResultWithUserAndPost(id_posts: number) {
      if( id_posts == undefined){
        return;
      }
      // console.log('fetching');
      let path = '/posts/likeResultWithUserAndPost/'+id_posts.toString();
      const res = await fetch(generateURL(path), generateRequestConfig({
        method: 'GET'
      }));

      res
        .json()
        .then(res => {
          // console.log("res:--------");
          // console.log(res);
          setValueVote(res.value);
        })
        .catch(err => setErrors(err));
    }

  React.useEffect( () => {
    // console.log(props.id_posts);
    // fetchDataLikeResult(props.id_posts,1);
    // console.log(props.value);
    // setValueVote(props.value);
    setValueVote(props.personalValue);
  }, []);

  const upVote = async () => {
      // console.log(valueVote);
      if(valueVote == null){
        setLikeResult(parseInt(likeResult)+1); 
        setValueVote(1);
        onVoteInsert(props.id_posts, 1);
      }
      else if(valueVote == -1){
        setLikeResult(parseInt(likeResult)+1); 
        setValueVote(0);
        onVoteUpdate(props.id_posts, 0);
      }
      else if(valueVote == 0){
        setLikeResult(parseInt(likeResult)+1); 
        setValueVote(1);
        onVoteUpdate(props.id_posts, 1);
      }
      else{
        console.log("Cannot add vote.");
      }
  }

  const downVote = () => {
    // console.log(valueVote);
    if(valueVote == null){
      setLikeResult(parseInt(likeResult)-1); 
      setValueVote(-1);
      onVoteInsert(props.id_posts, -1);
    }
    else if(valueVote == 1){
      setLikeResult(parseInt(likeResult)-1); 
      setValueVote(0);
      onVoteUpdate(props.id_posts, 0);
    }
    else if(valueVote == 0){
      setLikeResult(parseInt(likeResult)-1); 
      setValueVote(-1);
      onVoteUpdate(props.id_posts, -1);
    }
    else{
      console.log("Cannot add vote.");
    }
  }

  async function navigateToPost(value: number, 
    id_posts: number, id_users: number, 
    name: string, title: string, 
    post_content: string, created_at: string){
    navigate('/post/'+value+'/'+id_posts+'/'+likeResult+'/'+id_users+'/'+name+'/'+title+'/'+post_content+'/'+created_at);
  };

  const postComponent =  (
      <Grid   
      container
      direction="column"
      alignItems="center"
      >
        <Card sx={{ maxWidth: 1000, margin: 4}}>
        <CardHeader
            avatar={
            <Avatar sx={ {bgcolor: colors[(Math.random()*100)%5]}} aria-label="recipe">
                {props.name[0]}
            </Avatar>
            }
            title={props.title}
            subheader={props.created_at}
        />
        <CardContent>
            <Typography variant="body2" color="text.secondary">
            {props.post_content}
            </Typography>
        </CardContent>
        <CardActions disableSpacing>
          {/* <AuthContext.Consumer> */}
            <IconButton aria-label="upvote" onClick={ upVote }>
              <ThumbUpIcon />
            </IconButton>
          {/* </AuthContext.Consumer> */}
            <IconButton aria-label="downvote" onClick={ downVote }>
              <ThumbDownIcon/>
            </IconButton>
            <IconButton aria-label="vote value">
              {likeResult}
            </IconButton>
            <Button onClick={ () => navigateToPost(valueVote,
                                                props.id_posts,
                                                props.id_users, 
                                                props.name, 
                                                props.title, 
                                                props.post_content, 
                                                props.created_at) }>
              View post
            </Button>
        </CardActions>
        </Card>
    </Grid>
  );


  return postComponent;
}
