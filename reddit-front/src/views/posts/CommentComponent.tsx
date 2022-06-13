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

  const [likeResult, setLikeResult] = React.useState(parseInt(props.value));
  const [hasError, setErrors] = React.useState(false);
  const [valueVote, setValueVote] = React.useState(props.personalValue);
  const [hasVote, setHasVote] = React.useState(false);
  const navigate = useNavigate();

  const [expanded, setExpanded] = React.useState(false);
  const colors = [red[500], green[500], yellow[500], orange[500], blue[500]]
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

    const onVoteUpdate = async (_id_comments: number, _value: number) => {
      const data = {id_comments : _id_comments, value: _value};
      await fetch(generateURL('/comments/updateVote'), generateRequestConfig({
        method: 'POST',
        body: JSON.stringify(data)
      }));
    };

    const onVoteInsert = async (_id_comments: number, _value: number) => {
      const data = {id_comments : _id_comments, value: _value};
      await fetch(generateURL('/comments/insertVote'), generateRequestConfig({
        method: 'POST',
        body: JSON.stringify(data)
      }));
    };

    const [loginData, setLoginData] = React.useState<any>({nickname: null, email: null});
    const location = useLocation();

  React.useEffect( () => {
    setValueVote(props.personalValue);
    // console.log("value vote: ")
    // console.log(valueVote);
  }, []);

  const upVote = async () => {
    //   console.log(valueVote);
      if(valueVote == null){
        setLikeResult((likeResult)+1); 
        setValueVote(1);
        onVoteInsert(props.id_comments, 1);
      }
      else if(valueVote == -1){
        setLikeResult((likeResult)+1); 
        setValueVote(0);
        onVoteUpdate(props.id_comments, 0);
      }
      else if(valueVote == 0){
        setLikeResult((likeResult)+1); 
        setValueVote(1);
        onVoteUpdate(props.id_comments, 1);
      }
      else{
        console.log("Cannot add vote.");
      }
  }

  const downVote = () => {
    // console.log(valueVote);
    if(valueVote == null){
      setLikeResult((likeResult)-1); 
      setValueVote(-1);
      onVoteInsert(props.id_comments, -1);
    }
    else if(valueVote == 1){
      setLikeResult((likeResult)-1); 
      setValueVote(0);
      onVoteUpdate(props.id_comments, 0);
    }
    else if(valueVote == 0){
      setLikeResult((likeResult)-1); 
      setValueVote(-1);
      onVoteUpdate(props.id_comments, -1);
    }
    else{
      console.log("Cannot add vote.");
    }
  }


  const commentComponent =  (
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
            title={props.name}
            subheader={props.created_at}
        />
        <CardContent>
            <Typography variant="body2" color="text.secondary">
            {props.comment_content}
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
        </CardActions>
        </Card>
    </Grid>
  );


  return commentComponent;
}
